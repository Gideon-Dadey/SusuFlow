import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    beforeState?: unknown;
    afterState?: unknown;
    correlationId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceId: data.deviceId,
        beforeState: data.beforeState as object,
        afterState: data.afterState as object,
        correlationId: data.correlationId,
      },
    });
  }

  async findAll(tenantId: string, options: {
    userId?: string;
    action?: string;
    resourceType?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = options.limit || 50;
    const where: Record<string, unknown> = { tenantId };
    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;
    if (options.resourceType) where.resourceType = options.resourceType;

    const items = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    return { items: data, cursor: hasMore ? data[data.length - 1]?.id : undefined, hasMore };
  }
}
