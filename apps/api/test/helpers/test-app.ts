import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/prisma/prisma.service";
import { CacheService } from "../../src/cache/cache.service";
import { TransformInterceptor } from "../../src/common/interceptors/transform.interceptor";

export function createMockCache() {
  return {
    ping: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(false),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(undefined),
    isAvailable: jest.fn().mockReturnValue(true),
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
  };
}

export function createMockPrisma() {
  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
    tenant: {
      findUnique: jest.fn().mockResolvedValue({
        id: "tenant-1",
        slug: "abc-susu",
        name: "ABC Susu",
        status: "active",
      }),
    },
    user: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    customer: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn() },
    transaction: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
    },
    ledgerEntry: { createMany: jest.fn(), findMany: jest.fn() },
    account: { findUnique: jest.fn(), findMany: jest.fn() },
    payment: { create: jest.fn(), update: jest.fn() },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    role: { findUnique: jest.fn() },
    userRole: { create: jest.fn() },
    wallet: { create: jest.fn(), findFirst: jest.fn() },
    subscription: { create: jest.fn(), update: jest.fn() },
    setTenantContext: jest.fn(),
  };
}

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: ReturnType<typeof createMockPrisma>;
}> {
  const prisma = createMockPrisma();
  const cache = createMockCache();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(CacheService)
    .useValue(cache)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.init();

  return { app, prisma };
}
