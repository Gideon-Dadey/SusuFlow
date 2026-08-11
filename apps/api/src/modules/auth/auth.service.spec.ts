import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { getQueueToken } from "@nestjs/bullmq";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantService } from "../tenant/tenant.service";
import { OtpService } from "./otp.service";
import { CacheService } from "../../cache/cache.service";
import { MAX_FAILED_LOGINS } from "@susuflow/shared";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      update: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwt: { sign: jest.Mock };

  const mockUser = {
    id: "user-1",
    tenantId: "tenant-1",
    email: "test@example.com",
    passwordHash: "hash",
    firstName: "Test",
    lastName: "User",
    status: "active",
    failedLoginCount: 0,
    lockedUntil: null,
    userRoles: [
      {
        role: {
          name: "customer",
          rolePermissions: [{ permission: { name: "deposit:create" } }],
        },
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn(), update: jest.fn() },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue("access-token") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: { get: (key: string, def?: string) => def },
        },
        {
          provide: TenantService,
          useValue: {
            assertTenantOperational: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: OtpService,
          useValue: { send: jest.fn(), verify: jest.fn() },
        },
        {
          provide: CacheService,
          useValue: { set: jest.fn(), get: jest.fn(), del: jest.fn() },
        },
        {
          provide: getQueueToken("notifications"),
          useValue: { add: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    (bcrypt.compare as jest.Mock).mockReset();
  });

  describe("login", () => {
    it("returns tokens on successful login", async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(
        { email: "test@example.com", password: "password" },
        { id: "tenant-1", slug: "abc", name: "ABC", status: "active" },
      );

      expect(result.accessToken).toBe("access-token");
      expect(result.user?.email).toBe("test@example.com");
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginCount: 0 }),
        }),
      );
    });

    it("throws on invalid credentials", async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.update.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("locks account after max failed attempts", async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          ...mockUser,
          failedLoginCount: MAX_FAILED_LOGINS - 1,
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.update.mockResolvedValue({});

      await expect(
        service.login({ email: "test@example.com", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginCount: MAX_FAILED_LOGINS,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it("rejects login when account is locked", async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          ...mockUser,
          lockedUntil: new Date(Date.now() + 60_000),
        },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: "test@example.com", password: "pass" }),
      ).rejects.toThrow("Account temporarily locked");
    });
  });

  describe("logout", () => {
    it("revokes refresh token", async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.logout("some-refresh-token");
      expect(result.message).toContain("Logged out");
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });
});
