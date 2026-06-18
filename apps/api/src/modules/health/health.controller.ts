import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { Public } from '../../common/decorators';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    const redisHealthy = await this.cache.ping();
    const redisStatus = redisHealthy ? 'healthy' : 'unhealthy';

    const checks = { database: dbStatus, redis: redisStatus };
    const status = dbStatus === 'healthy' ? 'healthy' : 'degraded';

    return {
      status,
      version: '0.1.0',
      uptime: process.uptime(),
      checks,
    };
  }

  @Public()
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ready' };
  }
}
