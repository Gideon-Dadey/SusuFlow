import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes, randomInt } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantService } from "../tenant/tenant.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";
import {
  ROLES,
  MAX_FAILED_LOGINS,
  LOCKOUT_MINUTES,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_SEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
} from "@susuflow/shared";
import { TenantContext } from "@susuflow/shared";
import { OtpService } from "./otp.service";
import { CacheService } from "../../cache/cache.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tenantService: TenantService,
    private readonly otpService: OtpService,
    private readonly cache: CacheService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  async register(dto: RegisterDto, tenant: TenantContext) {
    await this.tenantService.assertTenantOperational(tenant.id);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId: tenant.id, email: dto.email },
    });
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customerRole = await this.prisma.role.findUnique({
      where: { name: ROLES.CUSTOMER },
    });
    if (!customerRole) throw new BadRequestException("System not configured");

    const customerCount = await this.prisma.customer.count({
      where: { tenantId: tenant.id },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: "pending",
        },
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: customerRole.id, tenantId: tenant.id },
      });

      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let customerNumber = "";
      for (let attempts = 0; attempts < 10; attempts++) {
        let code = "";
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await tx.customer.findFirst({
          where: { tenantId: tenant.id, customerNumber: code },
        });
        if (!existing) {
          customerNumber = code;
          break;
        }
      }
      if (!customerNumber) {
        customerNumber = Date.now().toString(36).toUpperCase().slice(-8);
      }

      const customer = await tx.customer.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          customerNumber,
          status: "pending",
          kycLevel: 0,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          walletType: "customer",
        },
      });

      const liabilityAccount = await tx.account.findUnique({
        where: { tenantId_code: { tenantId: tenant.id, code: "1100" } },
      });

      if (liabilityAccount) {
        await tx.account.create({
          data: {
            tenantId: tenant.id,
            walletId: wallet.id,
            code: `1100-${customer.id.slice(0, 5)}`,
            name: `Wallet: ${dto.firstName} ${dto.lastName}`,
            accountType: "liability",
          },
        });
      }

      return { user, customer };
    });

    await Promise.allSettled([
      this.otpService.send(result.user.id, "email", tenant.id),
      this.otpService.send(result.user.id, "phone", tenant.id),
    ]);

    return {
      userId: result.user.id,
      customerId: result.customer.id,
      message:
        "Registration successful. Verification codes sent to your email and phone.",
      verificationRequired: true,
    };
  }

  async login(dto: LoginDto, tenant?: TenantContext) {
    const users = await this.prisma.user.findMany({
      where: {
        email: dto.email,
      },
      include: {
        tenant: { select: { slug: true } },
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (users.length === 0) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Filter valid password matching candidates
    const validCandidates: typeof users = [];
    for (const candidate of users) {
      const isMatch = await bcrypt.compare(
        dto.password,
        candidate.passwordHash,
      );
      if (isMatch) {
        validCandidates.push(candidate);
      }
    }

    if (validCandidates.length === 0) {
      // Increment failed count for all candidate users with this email
      for (const candidate of users) {
        const failedCount = candidate.failedLoginCount + 1;
        const updateData: { failedLoginCount: number; lockedUntil?: Date } = {
          failedLoginCount: failedCount,
        };
        if (failedCount >= MAX_FAILED_LOGINS) {
          updateData.lockedUntil = new Date(
            Date.now() + LOCKOUT_MINUTES * 60 * 1000,
          );
        }
        await this.prisma.user.update({
          where: { id: candidate.id },
          data: updateData,
        });
      }
      throw new UnauthorizedException("Invalid credentials");
    }

    // Resolve the active candidate user using a prioritized selection strategy
    let user = null;
    if (tenant) {
      user = validCandidates.find((u) => u.tenantId === tenant.id);
    }
    if (!user) {
      user = validCandidates.find((u) => u.tenantId === null);
    }
    if (!user) {
      user = validCandidates[0];
    }

    if (user.tenantId) {
      await this.tenantService.assertTenantOperational(user.tenantId);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        "Account temporarily locked. Try again later.",
      );
    }

    const isCustomer = user.userRoles.some(
      (ur) => ur.role.name === ROLES.CUSTOMER,
    );
    if (isCustomer && user.status === "pending") {
      throw new ForbiddenException({
        message:
          "Please verify your email and phone before logging in, or ask your susu company to activate your account",
        code: "VERIFICATION_REQUIRED",
        userId: user.id,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);

    if (user.mfaEnabled) {
      const mfaToken = randomBytes(24).toString("hex");
      await this.cache.set(
        `mfa_session:${user.id}:${mfaToken}`,
        { userId: user.id, tenantId: user.tenantId },
        300,
      );
      try {
        await this.otpService.send(user.id, "email", user.tenantId || "", true);
      } catch {
        // Cooldown or sent code active
      }

      return {
        mfaRequired: true,
        mfaToken,
        userId: user.id,
        email: user.email,
        message: "MFA code sent to your email address",
      };
    }

    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ];

    const payload = {
      sub: user.id,
      tenant_id: user.tenantId,
      roles,
      permissions,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get("JWT_ACCESS_EXPIRY", "15m"),
    });

    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantSlug: user.tenant?.slug || "",
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: { include: { permission: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = stored.user;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ];

    const accessToken = this.jwt.sign(
      { sub: user.id, tenant_id: user.tenantId, roles, permissions },
      { expiresIn: this.config.get("JWT_ACCESS_EXPIRY", "15m") },
    );

    return { accessToken, expiresIn: 900 };
  }

  async logout(refreshToken: string) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return { message: "Logged out successfully" };
  }

  private passwordResetKey(userId: string) {
    return `password-reset:${userId}`;
  }

  private passwordResetCooldownKey(userId: string) {
    return `password-reset:cooldown:${userId}`;
  }

  private passwordResetHourlyKey(userId: string) {
    return `password-reset:hourly:${userId}`;
  }

  private hashResetCode(code: string) {
    return createHash("sha256").update(code).digest("hex");
  }

  private generateResetCode() {
    const length = Number(this.config.get("OTP_LENGTH", OTP_LENGTH));
    const max = 10 ** length;
    return String(randomInt(0, max)).padStart(length, "0");
  }

  private async resolveUserByEmail(email: string, tenant?: TenantContext) {
    const users = await this.prisma.user.findMany({
      where: { email },
      include: { tenant: { select: { id: true, name: true, slug: true } } },
    });
    if (users.length === 0) return null;
    if (tenant) {
      return users.find((u) => u.tenantId === tenant.id) ?? null;
    }
    return users.find((u) => u.tenantId !== null) ?? users[0];
  }

  async requestPasswordReset(email: string, tenant?: TenantContext) {
    const generic = {
      message:
        "If an account exists for this email, a reset code has been sent.",
    };

    if (!this.cache.isAvailable()) {
      throw new BadRequestException(
        "Password reset is temporarily unavailable. Try again later.",
      );
    }

    const user = await this.resolveUserByEmail(email, tenant);
    if (!user || !user.tenantId) return generic;

    const onCooldown = await this.cache.exists(
      this.passwordResetCooldownKey(user.id),
    );
    if (onCooldown) {
      throw new BadRequestException(
        `Wait ${OTP_SEND_COOLDOWN_SECONDS}s before requesting another code`,
      );
    }

    const sendCount = await this.cache.incr(
      this.passwordResetHourlyKey(user.id),
    );
    if (sendCount === 1) {
      await this.cache.expire(this.passwordResetHourlyKey(user.id), 3600);
    }
    if (sendCount > OTP_MAX_SENDS_PER_HOUR) {
      throw new BadRequestException(
        "Too many reset requests. Try again later.",
      );
    }

    const code = this.generateResetCode();
    await this.cache.set(
      this.passwordResetKey(user.id),
      { hash: this.hashResetCode(code), attempts: 0 },
      OTP_TTL_SECONDS,
    );
    await this.cache.set(
      this.passwordResetCooldownKey(user.id),
      true,
      OTP_SEND_COOLDOWN_SECONDS,
    );

    await this.notificationQueue.add("send-password-reset", {
      tenantId: user.tenantId,
      userId: user.id,
      recipient: user.email,
      code,
      tenantName: user.tenant?.name || "SusuFlow",
      firstName: user.firstName,
    });

    return generic;
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
    tenant?: TenantContext,
  ) {
    if (!this.cache.isAvailable()) {
      throw new BadRequestException(
        "Password reset is temporarily unavailable. Try again later.",
      );
    }

    const user = await this.resolveUserByEmail(email, tenant);
    if (!user) {
      throw new BadRequestException("Invalid reset code or email");
    }

    const stored = await this.cache.get<{
      hash: string;
      attempts: number;
    }>(this.passwordResetKey(user.id));

    if (!stored) {
      throw new BadRequestException(
        "Reset code expired or not found. Request a new one.",
      );
    }

    if (stored.attempts >= OTP_MAX_ATTEMPTS) {
      await this.cache.del(this.passwordResetKey(user.id));
      throw new ForbiddenException(
        "Too many failed attempts. Request a new code.",
      );
    }

    if (stored.hash !== this.hashResetCode(code)) {
      stored.attempts += 1;
      await this.cache.set(
        this.passwordResetKey(user.id),
        stored,
        OTP_TTL_SECONDS,
      );
      throw new BadRequestException("Invalid reset code");
    }

    await this.cache.del(this.passwordResetKey(user.id));

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
      });
      await tx.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { message: "Password reset successfully. You can sign in now." };
  }

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException("User not found");

    return this.otpService.send(userId, "email", user.tenantId || "", true);
  }

  async enableMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException("User not found");

    await this.otpService.verify(
      userId,
      "email",
      code,
      user.tenantId || "",
      true,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return {
      message: "Multi-Factor Authentication (MFA) enabled successfully.",
      mfaEnabled: true,
    };
  }

  async disableMfa(userId: string, password: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException("User not found");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException("Invalid password");

    await this.otpService.verify(
      userId,
      "email",
      code,
      user.tenantId || "",
      true,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false },
    });

    return {
      message: "Multi-Factor Authentication (MFA) disabled.",
      mfaEnabled: false,
    };
  }

  async verifyMfaLogin(mfaToken: string, userId: string, code: string) {
    const session = await this.cache.get<{ userId: string; tenantId: string }>(
      `mfa_session:${userId}:${mfaToken}`,
    );

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException(
        "MFA session expired or invalid. Please log in again.",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: { select: { slug: true } },
        userRoles: {
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    await this.otpService.verify(
      userId,
      "email",
      code,
      user.tenantId || "",
      true,
    );
    await this.cache.del(`mfa_session:${userId}:${mfaToken}`);

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ];

    const payload = {
      sub: user.id,
      tenant_id: user.tenantId,
      roles,
      permissions,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get("JWT_ACCESS_EXPIRY", "15m"),
    });

    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantSlug: user.tenant?.slug || "",
      },
    };
  }
}
