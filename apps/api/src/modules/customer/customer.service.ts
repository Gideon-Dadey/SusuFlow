import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { AuthenticatedUser, ROLES } from '@susuflow/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto, onboardedBy: AuthenticatedUser) {
    const count = await this.prisma.customer.count({ where: { tenantId } });

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { tenantId, email: dto.email },
      });
      if (existing) throw new ConflictException('Email already registered');
    }

    return this.prisma.$transaction(async (tx) => {
      let userId: string | undefined = undefined;

      if (dto.firstName || dto.lastName || dto.email) {
        const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
        const customerRole = await tx.role.findUnique({ where: { name: ROLES.CUSTOMER } });
        if (!customerRole) throw new Error('Customer role not configured');

        const tempEmail = dto.email || `customer-${count + 1}@temp.susuflow.com`;
        const user = await tx.user.create({
          data: {
            tenantId,
            email: tempEmail,
            phone: dto.phone,
            passwordHash,
            firstName: dto.firstName || 'Customer',
            lastName: dto.lastName || String(count + 1),
            status: 'active',
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
          customerNumber: `CUS-${String(count + 1).padStart(6, '0')}`,
          ghanaCardNumber: dto.ghanaCardNumber,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          address: dto.address,
          collectorId: dto.collectorId || (onboardedBy.roles.includes('collector') ? onboardedBy.id : undefined),
          onboardedById: onboardedBy.id,
          status: 'active',
          kycLevel: 1,
        },
      });

      const wallet = await tx.wallet.create({
        data: { tenantId, customerId: customer.id, walletType: 'customer' },
      });

      await tx.account.create({
        data: {
          tenantId,
          walletId: wallet.id,
          code: `1100-${customer.id.slice(0, 5)}`,
          name: `Wallet: ${dto.firstName || 'Customer'} ${dto.lastName || customer.customerNumber}`,
          accountType: 'liability',
        },
      });

      return customer;
    });
  }

  async findAll(tenantId: string, options: {
    search?: string;
    status?: string;
    collectorId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = options.limit || 20;
    const where: Record<string, unknown> = { tenantId };

    if (options.status) where.status = options.status;
    if (options.collectorId) where.collectorId = options.collectorId;
    if (options.search) {
      where.OR = [
        { customerNumber: { contains: options.search, mode: 'insensitive' } },
        { user: { firstName: { contains: options.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        wallets: { select: { id: true, status: true, walletType: true, currency: true } },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const hasMore = customers.length > limit;
    const items = hasMore ? customers.slice(0, -1) : customers;

    return { items, cursor: hasMore ? items[items.length - 1]?.id : undefined, hasMore };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        wallets: { include: { accounts: true } },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async activate(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id },
        data: { status: 'active' },
      });

      if (customer.userId) {
        await tx.user.update({
          where: { id: customer.userId },
          data: { status: 'active' },
        });
      }

      return updatedCustomer;
    });
  }
}
