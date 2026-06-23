import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ROLES, MAX_FAILED_LOGINS, LOCKOUT_MINUTES } from '@susuflow/shared';
import { TenantContext } from '@susuflow/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly tenantService: TenantService,
  ) {}

  async register(dto: RegisterDto, tenant: TenantContext) {
    await this.tenantService.assertTenantOperational(tenant.id);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId: tenant.id, email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customerRole = await this.prisma.role.findUnique({ where: { name: ROLES.CUSTOMER } });
    if (!customerRole) throw new BadRequestException('System not configured');

    const customerCount = await this.prisma.customer.count({ where: { tenantId: tenant.id } });

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: 'pending',
        },
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: customerRole.id, tenantId: tenant.id },
      });

      const customer = await tx.customer.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          customerNumber: `CUS-${String(customerCount + 1).padStart(6, '0')}`,
          status: 'pending',
          kycLevel: 0,
        },
      });

      const wallet = await tx.wallet.create({
        data: { tenantId: tenant.id, customerId: customer.id, walletType: 'customer' },
      });

      const liabilityAccount = await tx.account.findUnique({
        where: { tenantId_code: { tenantId: tenant.id, code: '1100' } },
      });

      if (liabilityAccount) {
        await tx.account.create({
          data: {
            tenantId: tenant.id,
            walletId: wallet.id,
            code: `1100-${customer.id.slice(0, 5)}`,
            name: `Wallet: ${dto.firstName} ${dto.lastName}`,
            accountType: 'liability',
          },
        });
      }

      return { user, customer };
    });

    return {
      userId: result.user.id,
      customerId: result.customer.id,
      message: 'Registration successful. Please verify your email and phone.',
    };
  }

  async login(dto: LoginDto, tenant?: TenantContext) {
    const users = await this.prisma.user.findMany({
      where: {
        email: dto.email,
      },
      include: {
        tenant: { select: { slug: true } },
        userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      },
    });

    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Filter valid password matching candidates
    const validCandidates: typeof users = [];
    for (const candidate of users) {
      const isMatch = await bcrypt.compare(dto.password, candidate.passwordHash);
      if (isMatch) {
        validCandidates.push(candidate);
      }
    }

    if (validCandidates.length === 0) {
      // Increment failed count for all candidate users with this email
      for (const candidate of users) {
        const failedCount = candidate.failedLoginCount + 1;
        const updateData: { failedLoginCount: number; lockedUntil?: Date } = { failedLoginCount: failedCount };
        if (failedCount >= MAX_FAILED_LOGINS) {
          updateData.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        }
        await this.prisma.user.update({ where: { id: candidate.id }, data: updateData });
      }
      throw new UnauthorizedException('Invalid credentials');
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
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name))),
    ];

    const payload = {
      sub: user.id,
      tenant_id: user.tenantId,
      roles,
      permissions,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

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
        tenantSlug: user.tenant?.slug || '',
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
          },
        },
      },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = stored.user;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name))),
    ];

    const accessToken = this.jwt.sign(
      { sub: user.id, tenant_id: user.tenantId, roles, permissions },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m') },
    );

    return { accessToken, expiresIn: 900 };
  }

  async logout(refreshToken: string) {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }
}
