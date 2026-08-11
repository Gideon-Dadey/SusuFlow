import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  clampPageLimit,
  normalizeNotificationPreferences,
} from "@susuflow/shared";
import { Prisma } from "@susuflow/database";
import { PrismaService } from "../../prisma/prisma.service";
import { enqueueNotification } from "../../common/notifications/enqueue";
import { UpdateNotificationPreferencesDto } from "./dto/notification.dto";

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  async listInbox(userId: string, cursor?: string, limit?: number) {
    const take = clampPageLimit(limit);
    const items = await this.prisma.notification.findMany({
      where: {
        userId,
        channel: "push",
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
    });

    const hasMore = items.length > take;
    const page = hasMore ? items.slice(0, take) : items;
    const unreadCount = await this.unreadCount(userId);

    return {
      items: page.map((row) => this.toInboxItem(row)),
      unreadCount,
      nextCursor: hasMore
        ? page[page.length - 1]?.createdAt.toISOString()
        : null,
    };
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, channel: "push", readAt: null },
    });
  }

  async markRead(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId, channel: "push" },
    });
    if (!existing) throw new NotFoundException("Notification not found");

    if (!existing.readAt) {
      await this.prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    return { read: true, unreadCount: await this.unreadCount(userId) };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, channel: "push", readAt: null },
      data: { readAt: new Date() },
    });
    return { read: true, unreadCount: 0 };
  }

  async getPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });
    if (!user) throw new NotFoundException("User not found");
    return normalizeNotificationPreferences(user.notificationPreferences);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ) {
    const current = await this.getPreferences(userId);
    const next = normalizeNotificationPreferences({
      ...current,
      ...dto,
      security: true,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: next as unknown as Prisma.InputJsonValue,
      },
    });

    return next;
  }

  async enqueueTest(userId: string, tenantId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, tenantId: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const resolvedTenantId = tenantId || user.tenantId;
    if (!resolvedTenantId) {
      throw new NotFoundException("No company is linked to this account");
    }

    await enqueueNotification(
      this.notificationQueue,
      "push-test",
      {
        tenantId: resolvedTenantId,
        userId: user.id,
        firstName: user.firstName,
      },
      `${user.id}:${Date.now()}`,
    );

    return { queued: true };
  }

  private toInboxItem(row: {
    id: string;
    template: string;
    subject: string | null;
    body: string;
    metadata: unknown;
    readAt: Date | null;
    createdAt: Date;
    status: string;
  }) {
    const metadata =
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {};

    const readString = (key: string) => {
      const value = metadata[key];
      return typeof value === "string" && value.trim()
        ? value.trim()
        : undefined;
    };

    const amountRaw = metadata.amount;
    const amount =
      typeof amountRaw === "number"
        ? amountRaw
        : typeof amountRaw === "string" && amountRaw.trim()
          ? Number(amountRaw)
          : undefined;

    return {
      id: row.id,
      type: row.template,
      category: readString("category") || "account",
      title: row.subject || "SusuFlow",
      body: row.body,
      status: readString("status") || row.status,
      screen: readString("screen") || "home",
      transactionId: readString("transactionId"),
      reference: readString("reference"),
      amount: Number.isFinite(amount) ? amount : undefined,
      readAt: row.readAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
