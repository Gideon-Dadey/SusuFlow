import {
  buildPushCopy,
  fetchExpoPushReceipts,
  getPushEventMeta,
  sendExpoPushNotifications,
  shouldDeliverPush,
  type ExpoPushMessage,
  type PushCopy,
} from "@susuflow/shared";
import type { PrismaClient } from "@susuflow/database";

export interface PushDispatchInput {
  event: string;
  userId: string;
  tenantId: string;
  title?: string;
  body?: string;
  firstName?: string | null;
  tenantName?: string | null;
  formattedAmount?: string | null;
  formattedBalance?: string | null;
  reference?: string | null;
  rejectionReason?: string | null;
  transactionId?: string | null;
  amount?: number | null;
  status?: string | null;
}

export async function dispatchPushToUser(
  db: PrismaClient,
  input: PushDispatchInput,
) {
  const meta = getPushEventMeta(input.event);
  const copy =
    input.title && input.body
      ? { title: input.title, body: input.body }
      : buildPushCopy(input.event, {
          firstName: input.firstName,
          tenantName: input.tenantName,
          formattedAmount: input.formattedAmount,
          formattedBalance: input.formattedBalance,
          reference: input.reference,
          rejectionReason: input.rejectionReason,
        });

  if (!copy || !meta) {
    return { sent: 0, skipped: true };
  }

  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { notificationPreferences: true },
  });

  const allowed = shouldDeliverPush(
    user?.notificationPreferences,
    meta.category,
  );
  const inbox = await persistInbox(db, input, copy, meta.category, meta.screen);

  if (!allowed) {
    console.log(
      `[push] Suppressed ${input.event} for user ${input.userId} by preference`,
    );
    return { sent: 0, skipped: true, inboxId: inbox.id };
  }

  const tokens = await db.userPushToken.findMany({
    where: { userId: input.userId },
    select: { id: true, token: true },
  });

  if (!tokens.length) {
    console.log(`[push] No tokens for user ${input.userId}`);
    return { sent: 0, inboxId: inbox.id };
  }

  const unreadCount = await db.notification.count({
    where: { userId: input.userId, channel: "push", readAt: null },
  });

  const deepLink =
    meta.screen === "activity" && input.reference
      ? `susuflow://activity?reference=${encodeURIComponent(input.reference)}`
      : meta.screen === "kyc"
        ? "susuflow://kyc"
        : meta.screen === "security"
          ? "susuflow://security"
          : "susuflow://home";

  const data: Record<string, string> = {
    type: input.event,
    screen: meta.screen,
    category: meta.category,
    deepLink,
    inboxId: inbox.id,
  };
  if (input.reference) data.reference = input.reference;
  if (input.transactionId) data.transactionId = input.transactionId;

  const messages: ExpoPushMessage[] = tokens.map((row) => ({
    to: row.token,
    title: copy.title,
    body: copy.body,
    subtitle: copy.subtitle,
    sound: "default",
    priority: "high",
    channelId: meta.channelId,
    categoryId: meta.category,
    interruptionLevel: meta.interruptionLevel,
    badge: unreadCount,
    ttl: 60 * 60 * 24 * 7,
    collapseId: input.reference
      ? `txn:${input.reference}`
      : `${input.event}:${input.userId}`,
    data,
  }));

  const tickets = await sendExpoPushNotifications(messages);
  const staleTokenIds: string[] = [];
  const receiptIds: string[] = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status === "ok" && ticket.id) {
      receiptIds.push(ticket.id);
      return;
    }
    if (ticket.status !== "error") return;
    const errorCode = ticket.details?.error;
    if (errorCode === "DeviceNotRegistered") {
      const stale = tokens[index];
      if (stale) staleTokenIds.push(stale.id);
    }
    console.warn(`[push] Ticket error: ${ticket.message ?? errorCode}`);
  });

  if (receiptIds.length) {
    await pruneFromReceipts(db, tokens, tickets, receiptIds, staleTokenIds);
  }

  if (staleTokenIds.length) {
    await db.userPushToken.deleteMany({ where: { id: { in: staleTokenIds } } });
  }

  const sent = tickets.filter((ticket) => ticket.status === "ok").length;
  await db.notification.update({
    where: { id: inbox.id },
    data: {
      status: sent > 0 ? "sent" : "failed",
      sentAt: sent > 0 ? new Date() : null,
    },
  });

  console.log(`[push] Sent ${sent}/${tokens.length} to user ${input.userId}`);
  return { sent, inboxId: inbox.id };
}

async function persistInbox(
  db: PrismaClient,
  input: PushDispatchInput,
  copy: PushCopy,
  category: string,
  screen: string,
) {
  return db.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      channel: "push",
      template: input.event,
      recipient: input.userId,
      subject: copy.title,
      body: copy.body,
      status: "pending",
      metadata: {
        category,
        screen,
        reference: input.reference ?? undefined,
        transactionId: input.transactionId ?? undefined,
        amount: input.amount ?? undefined,
        status: input.status ?? undefined,
      },
    },
  });
}

async function pruneFromReceipts(
  db: PrismaClient,
  tokens: { id: string; token: string }[],
  tickets: { status: string; id?: string }[],
  receiptIds: string[],
  staleTokenIds: string[],
) {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  try {
    const receipts = await fetchExpoPushReceipts(receiptIds);
    tickets.forEach((ticket, index) => {
      if (!ticket.id) return;
      const receipt = receipts[ticket.id];
      if (receipt?.status !== "error") return;
      if (receipt.details?.error === "DeviceNotRegistered") {
        const stale = tokens[index];
        if (stale) staleTokenIds.push(stale.id);
      }
      console.warn(
        `[push] Receipt error: ${receipt.message ?? receipt.details?.error}`,
      );
    });
  } catch (error) {
    console.warn(
      "[push] Receipt poll failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

/** @deprecated Use dispatchPushToUser */
export async function sendPushToUser(
  db: PrismaClient,
  userId: string,
  content: { title: string; body: string; data: Record<string, string> },
) {
  const tenant = await db.user.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });
  if (!tenant?.tenantId) {
    console.warn(`[push] No tenant for user ${userId}`);
    return { sent: 0 };
  }
  return dispatchPushToUser(db, {
    event: content.data.type || "push-test",
    userId,
    tenantId: tenant.tenantId,
    title: content.title,
    body: content.body,
    reference: content.data.reference,
    transactionId: content.data.transactionId,
  });
}
