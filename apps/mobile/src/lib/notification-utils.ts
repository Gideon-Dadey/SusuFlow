import { formatGhs } from "@/lib/currency";
import type { InboxNotification, Transaction } from "@/lib/api";
import type { AppNotification, NotificationKind } from "@/types/notification";

const PENDING_STATUSES = new Set([
  "pending",
  "processing",
  "requested",
  "pending_confirmation",
]);

export function isPendingNotificationStatus(status: string): boolean {
  return PENDING_STATUSES.has(status.toLowerCase());
}

export function buildNotificationFromTransaction(
  transaction: Transaction,
): AppNotification {
  const kind: NotificationKind =
    transaction.type === "deposit" ? "deposit" : "withdrawal";
  const amount = Number(transaction.amount);
  const formatted = formatGhs(amount);
  const status = transaction.status.toLowerCase();

  let title: string;
  let body: string;

  if (kind === "deposit") {
    if (status === "completed") {
      title = "Deposit received";
      body = `${formatted} has been added to your wallet.`;
    } else if (isPendingNotificationStatus(status)) {
      title = "Deposit in progress";
      body = `Your ${formatted} deposit is being processed.`;
    } else {
      title = "Deposit update";
      body = `Deposit of ${formatted} — ${status.replace(/_/g, " ")}.`;
    }
  } else if (status === "completed") {
    title = "Withdrawal completed";
    body = `${formatted} has been sent to your MoMo account.`;
  } else if (isPendingNotificationStatus(status)) {
    title = "Withdrawal requested";
    body = `Your ${formatted} withdrawal is awaiting approval.`;
  } else if (status === "rejected" || status === "failed") {
    title = "Withdrawal not completed";
    body = `Withdrawal of ${formatted} was ${status}.`;
  } else {
    title = "Withdrawal update";
    body = `Withdrawal of ${formatted} — ${status.replace(/_/g, " ")}.`;
  }

  return {
    id: transaction.id,
    kind,
    title,
    body,
    amount,
    currency: transaction.currency || "GHS",
    status: transaction.status,
    createdAt: transaction.createdAt,
    reference: transaction.reference,
    transaction,
    screen: "activity",
  };
}

export function kindFromInboxType(
  type: string,
  category?: string,
): NotificationKind {
  const value = `${type} ${category || ""}`.toLowerCase();
  if (value.includes("deposit")) return "deposit";
  if (value.includes("withdrawal")) return "withdrawal";
  if (value.includes("kyc") || value.includes("identity")) return "kyc";
  if (value.includes("security") || value.includes("password"))
    return "security";
  return "account";
}

export function buildNotificationFromInbox(
  item: InboxNotification,
  transaction?: Transaction,
): AppNotification {
  return {
    id: item.id,
    kind: kindFromInboxType(item.type, item.category),
    title: item.title,
    body: item.body,
    amount: item.amount,
    currency: "GHS",
    status: item.status,
    createdAt: item.createdAt,
    reference: item.reference || "",
    transaction,
    screen: item.screen,
    inboxId: item.id,
    readAt: item.readAt,
  };
}

export function buildNotificationFeed(
  deposits: Transaction[] = [],
  withdrawals: Transaction[] = [],
): AppNotification[] {
  const items = [...deposits, ...withdrawals].map(
    buildNotificationFromTransaction,
  );
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return items.slice(0, 30);
}

export function mergeNotificationFeeds(
  inbox: AppNotification[],
  local: AppNotification[],
): AppNotification[] {
  const seen = new Set<string>();
  const merged: AppNotification[] = [];

  const remember = (item: AppNotification) => {
    const keys = [item.id, item.inboxId, item.reference, item.transaction?.id]
      .filter(Boolean)
      .map((value) => String(value));
    if (keys.some((key) => seen.has(key))) return;
    keys.forEach((key) => seen.add(key));
    merged.push(item);
  };

  inbox.forEach(remember);
  local.forEach(remember);
  merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return merged.slice(0, 40);
}

export function countUnreadNotifications(
  items: AppNotification[],
  lastSeenAt: string | null,
): number {
  const seenTime = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  return items.filter((item) => {
    if (item.readAt) return false;
    if (item.inboxId) return !item.readAt;
    if (!lastSeenAt) return false;
    return new Date(item.createdAt).getTime() > seenTime;
  }).length;
}

export function formatNotificationTime(dateStr: string): string {
  try {
    const seconds = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}
