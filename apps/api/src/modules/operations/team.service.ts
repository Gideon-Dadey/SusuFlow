import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ROLES } from "@susuflow/shared";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { CreateTeamMemberDto, UpdateTeamMemberDto } from "./dto/operations.dto";

const STAFF_ROLE_NAMES = [
  ROLES.COMPANY_ADMIN,
  ROLES.ACCOUNT_OFFICER,
  ROLES.COLLECTOR,
  ROLES.AUDITOR,
];

function generateTempPassword(): string {
  const base = randomBytes(9).toString("base64url");
  return `${base}A1!`;
}

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async listTeam(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        userRoles: {
          some: {
            role: { name: { in: STAFF_ROLE_NAMES } },
          },
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: { role: { select: { name: true } } },
        },
        _count: {
          select: { collectedCustomers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        roles: user.userRoles.map((ur) => ur.role.name),
        customerCount: user._count.collectedCustomers,
      })),
    };
  }

  async createTeamMember(tenantId: string, dto: CreateTeamMemberDto) {
    const existing = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email },
    });
    if (existing) {
      throw new ConflictException(
        "A user with this email already exists in your organization",
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });
    if (!role) {
      throw new BadRequestException("Invalid role");
    }

    const tempPassword = dto.password || generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          status: "active",
          emailVerified: true,
          phoneVerified: !!dto.phone,
        },
      });

      await tx.userRole.create({
        data: { userId: created.id, roleId: role.id, tenantId },
      });

      return created;
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: [dto.role],
      },
      credentials: dto.password
        ? undefined
        : {
            email: user.email,
            temporaryPassword: tempPassword,
          },
      message: `${dto.role.replace(/_/g, " ")} account created successfully`,
    };
  }

  async updateTeamMember(
    tenantId: string,
    userId: string,
    dto: UpdateTeamMemberDto,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException("Team member not found");
    }

    const isStaff = user.userRoles.some((ur) =>
      STAFF_ROLE_NAMES.includes(
        ur.role.name as (typeof STAFF_ROLE_NAMES)[number],
      ),
    );
    if (!isStaff) {
      throw new BadRequestException("User is not a team member");
    }

    const isCompanyAdmin = user.userRoles.some(
      (ur) => ur.role.name === ROLES.COMPANY_ADMIN,
    );
    if (isCompanyAdmin && dto.status === "suspended") {
      throw new BadRequestException("Cannot suspend the company administrator");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        status: true,
        userRoles: { include: { role: { select: { name: true } } } },
      },
    });

    return {
      user: {
        ...updated,
        roles: updated.userRoles.map((ur) => ur.role.name),
      },
      message: "Team member updated successfully",
    };
  }
}
