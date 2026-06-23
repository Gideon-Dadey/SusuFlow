import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { Public } from "../../common/decorators";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    @InjectQueue("notifications") private readonly notificationsQueue: Queue,
    @InjectQueue("receipts") private readonly receiptsQueue: Queue,
  ) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = "healthy";
    let migrationStatus = "unknown";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const migrations = await this.prisma.$queryRaw<
        { migration_name: string }[]
      >`
        SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL LIMIT 1
      `;
      migrationStatus = migrations.length > 0 ? "pending" : "applied";
    } catch {
      dbStatus = "unhealthy";
      migrationStatus = "unknown";
    }

    const redisHealthy = await this.cache.ping();
    const redisStatus = redisHealthy ? "healthy" : "unhealthy";

    let notificationsQueue = "unknown";
    let receiptsQueue = "unknown";
    try {
      const notifCounts = await this.notificationsQueue.getJobCounts(
        "waiting",
        "active",
        "delayed",
        "failed",
      );
      notificationsQueue =
        notifCounts.failed > 10
          ? "degraded"
          : redisHealthy
            ? "healthy"
            : "unavailable";
    } catch {
      notificationsQueue = "unavailable";
    }

    try {
      const receiptCounts = await this.receiptsQueue.getJobCounts(
        "waiting",
        "active",
        "delayed",
        "failed",
      );
      receiptsQueue =
        receiptCounts.failed > 10
          ? "degraded"
          : redisHealthy
            ? "healthy"
            : "unavailable";
    } catch {
      receiptsQueue = "unavailable";
    }

    const checks = {
      database: dbStatus,
      redis: redisStatus,
      migrations: migrationStatus,
      queues: {
        notifications: notificationsQueue,
        receipts: receiptsQueue,
      },
    };

    const allHealthy =
      dbStatus === "healthy" &&
      redisStatus === "healthy" &&
      migrationStatus !== "pending" &&
      notificationsQueue !== "unavailable" &&
      receiptsQueue !== "unavailable";

    return {
      status: allHealthy ? "healthy" : "degraded",
      version: process.env.npm_package_version || "0.1.0",
      uptime: process.uptime(),
      nodeVersion: process.version,
      checks,
    };
  }

  @Public()
  @Get("live")
  live() {
    return { status: "ok" };
  }

  @Public()
  @Get("ready")
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redisOk = await this.cache.ping();
    if (!redisOk) {
      throw new ServiceUnavailableException("Redis not ready");
    }
    const pending = await this.prisma.$queryRaw<{ migration_name: string }[]>`
      SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL LIMIT 1
    `;
    if (pending.length > 0) {
      throw new ServiceUnavailableException("Pending database migrations");
    }
    return { status: "ready" };
  }
}
