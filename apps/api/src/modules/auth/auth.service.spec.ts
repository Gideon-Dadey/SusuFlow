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
    device: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwt: { sign: jest.Mock };
  let notificationQueue: { add: jest.Mock };

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
    lastLoginAt: new Date("2026-01-01T00:00:00.000Z"),
    mfaEnabled: false,
    tenant: { slug: "abc" },
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
      device: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: "device-1" }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue("access-token") };
    notificationQueue = { add: jest.fn().mockResolvedValue({}) };

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
          useValue: notificationQueue,
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

    it("does not alert when the same device signs in again", async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});
      prisma.device.findUnique.mockResolvedValue({
        id: "device-known",
        fingerprint: "sf_known_device_fingerprint",
      });

      await service.login(
        {
          email: "test@example.com",
          password: "password",
          deviceFingerprint: "sf_known_device_fingerprint",
          deviceName: "iPhone",
        },
        { id: "tenant-1", slug: "abc", name: "ABC", status: "active" },
      );

      expect(prisma.device.update).toHaveBeenCalled();
      expect(notificationQueue.add).not.toHaveBeenCalledWith(
        "security-new-login",
        expect.anything(),
        expect.anything(),
      );
    });

    it("alerts when a new device signs in after a prior login", async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});
      prisma.device.findUnique.mockResolvedValue(null);
      prisma.device.create.mockResolvedValue({ id: "device-new" });

      await service.login(
        {
          email: "test@example.com",
          password: "password",
          deviceFingerprint: "sf_brand_new_device_fp",
          deviceName: "Pixel 8",
        },
        { id: "tenant-1", slug: "abc", name: "ABC", status: "active" },
      );

      expect(prisma.device.create).toHaveBeenCalled();
      expect(notificationQueue.add).toHaveBeenCalledWith(
        "security-new-login",
        expect.objectContaining({
          userId: "user-1",
          deviceName: "Pixel 8",
        }),
        expect.anything(),
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
