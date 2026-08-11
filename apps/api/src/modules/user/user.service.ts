import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import {
  UpdateUserProfileDto,
  UpdateUserPasswordDto,
  DeleteAccountDto,
  RegisterPushTokenDto,
  RemovePushTokenDto,
} from "./dto/user.dto";
import { enqueueNotification } from "../../common/notifications/enqueue";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            customerNumber: true,
            status: true,
            kycLevel: true,
            kycStatus: true,
            ghanaCardNumber: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException("User not found");

    if (!user.customer) {
      let tenantId = user.tenantId;
      if (!tenantId) {
        const tenant = await this.prisma.tenant.findFirst({
          where: { status: "active" },
        });
        tenantId = tenant?.id || null;
      }

      if (tenantId) {
        const targetTenantId = tenantId;
        const customer = await this.prisma.$transaction(async (tx) => {
          const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
          let customerNumber = "";
          for (let attempts = 0; attempts < 10; attempts++) {
            let code = "";
            for (let i = 0; i < 8; i++) {
              code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existing = await tx.customer.findFirst({
              where: { tenantId: targetTenantId, customerNumber: code },
            });
            if (!existing) {
              customerNumber = code;
              break;
            }
          }
          if (!customerNumber) {
            customerNumber = Date.now().toString(36).toUpperCase().slice(-8);
          }

          const newCustomer = await tx.customer.create({
            data: {
              tenantId: targetTenantId,
              userId: user.id,
              customerNumber,
              status: "active",
              kycLevel: 1,
            },
          });

          const wallet = await tx.wallet.create({
            data: {
              tenantId: targetTenantId,
              customerId: newCustomer.id,
              walletType: "customer",
            },
          });

          const compact = newCustomer.id.replace(/-/g, "").slice(0, 8);
          const code = `11${compact}`.slice(0, 10);

          await tx.account.create({
            data: {
              tenantId: targetTenantId,
              walletId: wallet.id,
              code,
              name: `Wallet: ${user.firstName} ${user.lastName}`,
              accountType: "liability",
            },
          });

          return newCustomer;
        });

        user.customer = {
          id: customer.id,
          customerNumber: customer.customerNumber,
          status: customer.status,
          kycLevel: customer.kycLevel,
          kycStatus: customer.kycStatus,
          ghanaCardNumber: customer.ghanaCardNumber,
        };
      }
    }

    return user;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (dto.email && dto.email !== user.email) {
      // Check if email already registered in the tenant
      const existing = await this.prisma.user.findFirst({
        where: {
          tenantId: user.tenantId,
          email: dto.email,
          id: { not: id },
        },
      });
      if (existing) throw new ConflictException("Email already in use");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        status: true,
        emailVerified: true,
      },
    });
  }

  async updatePassword(id: string, dto: UpdateUserPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) throw new BadRequestException("Incorrect current password");

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    if (user.tenantId) {
      void enqueueNotification(
        this.notificationQueue,
        "password-changed",
        {
          tenantId: user.tenantId,
          userId: user.id,
          firstName: user.firstName,
        },
        `${user.id}:${Date.now()}`,
      ).catch(() => undefined);
    }

    return { message: "Password updated successfully" };
  }

  async deleteAccount(id: string, dto: DeleteAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) throw new BadRequestException("Incorrect password");

    const tombstoneEmail = `deleted-${id}@removed.susuflow.local`;
    const randomPasswordHash = await bcrypt.hash(
      randomBytes(32).toString("hex"),
      12,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await tx.userPushToken.deleteMany({ where: { userId: id } });

      if (user.customer) {
        await tx.customer.update({
          where: { id: user.customer.id },
          data: { status: "closed", userId: null },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          status: "suspended",
          email: tombstoneEmail,
          phone: null,
          firstName: "Deleted",
          lastName: "Account",
          passwordHash: randomPasswordHash,
          emailVerified: false,
          phoneVerified: false,
        },
      });
    });

    return { message: "Account deleted successfully" };
  }

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    await this.prisma.userPushToken.upsert({
      where: { token: dto.token },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
        deviceName: dto.deviceName,
        appVersion: dto.appVersion,
        lastSeenAt: new Date(),
      },
      update: {
        userId,
        platform: dto.platform,
        deviceName: dto.deviceName,
        appVersion: dto.appVersion,
        lastSeenAt: new Date(),
      },
    });
    return { registered: true };
  }

  async removePushToken(userId: string, dto: RemovePushTokenDto) {
    await this.prisma.userPushToken.deleteMany({
      where: { userId, token: dto.token },
    });
    return { removed: true };
  }
}
