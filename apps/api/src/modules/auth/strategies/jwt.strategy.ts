import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '@susuflow/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      },
    });

    if (!user || (user.status !== 'active' && user.status !== 'pending')) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const roles = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);
    const permissions = [
      ...new Set(
        user.userRoles.flatMap((ur: { role: { rolePermissions: { permission: { name: string } }[] } }) =>
          ur.role.rolePermissions.map((rp) => rp.permission.name),
        ),
      ),
    ] as string[];

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
      permissions,
    };
  }
}
