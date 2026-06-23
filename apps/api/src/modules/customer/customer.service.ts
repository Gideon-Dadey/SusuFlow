import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/customer.dto";
import {
  AuthenticatedUser,
  ROLES,
  clampPageLimit,
  encryptField,
  decryptField,
} from "@susuflow/shared";
import { Prisma } from "@susuflow/database";
import { AuditService } from "../audit/audit.service";
import { handlePrismaError } from "../../common/utils/prisma-errors";
import * as bcrypt from "bcrypt";

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private get encryptionKey(): string {
    return this.config.get<string>(
      "ENCRYPTION_KEY",
      "dev-encryption-key-not-for-production",
    );
  }

  private encryptPii(value?: string | null): string | undefined {
    if (!value) return undefined;
    return encryptField(value, this.encryptionKey);
  }

  private decryptCustomer<T extends { ghanaCardNumber?: string | null }>(
    customer: T,
  ): T {
    if (customer.ghanaCardNumber) {
      return {
        ...customer,
        ghanaCardNumber: decryptField(
          customer.ghanaCardNumber,
          this.encryptionKey,
        ),
      };
    }
    return customer;
  }

  private walletAccountCode(customerId: string): string {
    const compact = customerId.replace(/-/g, "").slice(0, 8);
    return `11${compact}`.slice(0, 10);
  }

  private async nextCustomerNumber(
    tx: Prisma.TransactionClient,
    tenantId: string,
  ): Promise<string> {
    const latest = await tx.customer.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: { customerNumber: true },
    });
    const match = latest?.customerNumber?.match(/(\d+)$/);
    const next = match ? Number.parseInt(match[1], 10) + 1 : 1;
    return `CUS-${String(next).padStart(6, "0")}`;
  }

  async create(
    tenantId: string,
    dto: CreateCustomerDto,
    onboardedBy: AuthenticatedUser,
  ) {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { tenantId, email: dto.email },
      });
      if (existing) throw new ConflictException("Email already registered");
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const customerNumber = await this.nextCustomerNumber(tx, tenantId);
        let userId: string | undefined = undefined;

        if (dto.firstName || dto.lastName || dto.email) {
          const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
          const customerRole = await tx.role.findUnique({
            where: { name: ROLES.CUSTOMER },
          });
          if (!customerRole) {
            throw new InternalServerErrorException(
              "Customer role is not configured. Contact your platform administrator.",
            );
          }

          const tempEmail =
            dto.email ||
            `customer-${customerNumber.replace(/\D/g, "")}@temp.susuflow.com`;

          const user = await tx.user.create({
            data: {
              tenantId,
              email: tempEmail,
              phone: dto.phone,
              passwordHash,
              firstName: dto.firstName || "Customer",
              lastName: dto.lastName || customerNumber.replace("CUS-", ""),
              status: "active",
              emailVerified: !!dto.email,
            },
          });

          await tx.userRole.create({
            data: { userId: user.id, roleId: customerRole.id, tenantId },
          });

          userId = user.id;
        }

        const customer = await tx.customer.create({
          data: {
            tenantId,
            userId,
            customerNumber,
            ghanaCardNumber: this.encryptPii(dto.ghanaCardNumber),
            dateOfBirth: dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : undefined,
            address: dto.address,
            collectorId:
              dto.collectorId ||
              (onboardedBy.roles.includes("collector")
                ? onboardedBy.id
                : undefined),
            onboardedById: onboardedBy.id,
            status: "active",
            kycLevel: 1,
          },
        });

        const wallet = await tx.wallet.create({
          data: { tenantId, customerId: customer.id, walletType: "customer" },
        });

        await tx.account.create({
          data: {
            tenantId,
            walletId: wallet.id,
            code: this.walletAccountCode(customer.id),
            name: `Wallet: ${dto.firstName || "Customer"} ${dto.lastName || customer.customerNumber}`,
            accountType: "liability",
          },
        });

        return customer;
      });

      await this.audit.log({
        tenantId,
        userId: onboardedBy.id,
        action: "customer:create",
        resourceType: "customer",
        resourceId: result.id,
        afterState: {
          customerNumber: result.customerNumber,
          collectorId: result.collectorId,
          onboardedById: result.onboardedById,
        },
      });

      return result;
    } catch (error) {
      handlePrismaError(error, "customer:create");
    }
  }

  async findAll(
    tenantId: string,
    options: {
      search?: string;
      status?: string;
      collectorId?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, unknown> = { tenantId };

    if (options.status) where.status = options.status;
    if (options.collectorId) where.collectorId = options.collectorId;
    if (options.search) {
      where.OR = [
        { customerNumber: { contains: options.search, mode: "insensitive" } },
        {
          user: {
            firstName: { contains: options.search, mode: "insensitive" },
          },
        },
        {
          user: { lastName: { contains: options.search, mode: "insensitive" } },
        },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        wallets: {
          select: { id: true, status: true, walletType: true, currency: true },
        },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const hasMore = customers.length > limit;
    const items = (hasMore ? customers.slice(0, -1) : customers).map((c) =>
      this.decryptCustomer(c),
    );

    return {
      items,
      cursor: hasMore ? items[items.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async findOne(tenantId: string, id: string, user?: AuthenticatedUser) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        wallets: { include: { accounts: true } },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    if (
      user?.roles.includes(ROLES.COLLECTOR) &&
      customer.collectorId !== user.id
    ) {
      throw new NotFoundException("Customer not found");
    }

    return this.decryptCustomer(customer);
  }

  async activate(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!customer) throw new NotFoundException("Customer profile not found");

    return this.prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id },
        data: { status: "active" },
      });

      if (customer.userId) {
        await tx.user.update({
          where: { id: customer.userId },
          data: {
            status: "active",
            emailVerified: true,
            phoneVerified: true,
          },
        });
      }

      return updatedCustomer;
    });
  }
}
