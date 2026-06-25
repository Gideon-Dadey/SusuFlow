import type { Transaction } from "@/lib/api";
import {
  getReceiptPaymentMethod,
  getReceiptPhoneLabel,
} from "@susuflow/shared/client";

export type ActivityFilter = "all" | "deposit" | "withdrawal";

export type ActivityPeriod = "this_month" | "last_month" | "all_time";

export const ACTIVITY_PERIOD_LABELS: Record<ActivityPeriod, string> = {
  this_month: "This month",
  last_month: "Last month",
  all_time: "All time",
};

export function formatActivityDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatActivityDateShort(iso: string): string {
  return new Date(iso).toLocaleString("en-GH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTransactionTitle(transaction: Transaction): string {
  return getActivityTransactionTitle(transaction);
}

export function getActivityTransactionTitle(transaction: Transaction): string {
  return transaction.type === "deposit" ? "Deposit" : "Withdrawal";
}

export function formatActivityListMeta(transaction: Transaction): string {
  const date = new Date(transaction.createdAt);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("en-GH", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return formatActivityDateShort(transaction.createdAt);
}

export function isTransactionSettled(status: string): boolean {
  return status === "completed" || status === "success";
}

export function isAttentionStatus(status: string): boolean {
  return (
    !isTransactionSettled(status) &&
    status !== "cancelled" &&
    status !== "canceled"
  );
}

export function getPaymentMethodLabel(transaction: Transaction): string {
  return getReceiptPaymentMethod(transaction).replace(/_/g, " ");
}

export function getPhoneLabel(transaction: Transaction): string | null {
  return getReceiptPhoneLabel(transaction);
}

export function filterTransactions(
  items: Transaction[],
  filter: ActivityFilter,
): Transaction[] {
  if (filter === "all") return items;
  if (filter === "deposit") {
    return items.filter((t) => t.type === "deposit");
  }
  return items.filter((t) => t.type !== "deposit");
}

function getPeriodBounds(period: ActivityPeriod) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "all_time") {
    return { start: null as Date | null, end: null as Date | null };
  }

  if (period === "this_month") {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0, 23, 59, 59, 999),
    };
  }

  const lastMonth = month === 0 ? 11 : month - 1;
  const lastYear = month === 0 ? year - 1 : year;
  return {
    start: new Date(lastYear, lastMonth, 1),
    end: new Date(lastYear, lastMonth + 1, 0, 23, 59, 59, 999),
  };
}

function getComparisonBounds(period: ActivityPeriod) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === "this_month") {
    const compareMonth = month === 0 ? 11 : month - 1;
    const compareYear = month === 0 ? year - 1 : year;
    return {
      start: new Date(compareYear, compareMonth, 1),
      end: new Date(compareYear, compareMonth + 1, 0, 23, 59, 59, 999),
    };
  }

  if (period === "last_month") {
    const currentStartMonth = month === 0 ? 10 : month - 2;
    const currentStartYear = month <= 1 ? year - 1 : year;
    return {
      start: new Date(currentStartYear, currentStartMonth, 1),
      end: new Date(
        currentStartYear,
        currentStartMonth + 1,
        0,
        23,
        59,
        59,
        999,
      ),
    };
  }

  return { start: null, end: null };
}

export function filterTransactionsByPeriod(
  items: Transaction[],
  period: ActivityPeriod,
): Transaction[] {
  const { start, end } = getPeriodBounds(period);
  if (!start || !end) return items;

  return items.filter((t) => {
    const date = new Date(t.createdAt);
    return date >= start && date <= end;
  });
}

function sumSettledFlow(items: Transaction[]) {
  let moneyIn = 0;
  let moneyOut = 0;

  for (const t of items) {
    if (!isTransactionSettled(t.status)) continue;
    const amount = Number(t.amount);
    if (t.type === "deposit") moneyIn += amount;
    else moneyOut += amount;
  }

  return { moneyIn, moneyOut, netFlow: moneyIn - moneyOut };
}

function sampleSeries(values: number[], maxPoints = 8) {
  if (values.length <= maxPoints) return values;
  const sampled: number[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i / (maxPoints - 1)) * (values.length - 1));
    sampled.push(values[index]);
  }
  return sampled;
}

export interface ActivityPeriodInsights {
  period: ActivityPeriod;
  netFlow: number;
  moneyIn: number;
  moneyOut: number;
  transactionCount: number;
  settledCount: number;
  attentionCount: number;
  successRate: number | null;
  averageDeposit: number | null;
  periodDeltaPct: number | null;
  sparklineValues: number[];
}

export function computeActivityPeriodInsights(
  items: Transaction[],
  period: ActivityPeriod,
): ActivityPeriodInsights {
  const scoped = filterTransactionsByPeriod(items, period);
  const { moneyIn, moneyOut, netFlow } = sumSettledFlow(scoped);

  let settledCount = 0;
  let attentionCount = 0;
  let depositTotal = 0;
  let depositCount = 0;

  for (const t of scoped) {
    if (isTransactionSettled(t.status)) {
      settledCount += 1;
      if (t.type === "deposit") {
        depositTotal += Number(t.amount);
        depositCount += 1;
      }
    } else if (isAttentionStatus(t.status)) {
      attentionCount += 1;
    }
  }

  const successRate =
    scoped.length > 0 ? Math.round((settledCount / scoped.length) * 100) : null;
  const averageDeposit = depositCount > 0 ? depositTotal / depositCount : null;

  const comparisonItems = getComparisonBounds(period);
  let periodDeltaPct: number | null = null;
  if (comparisonItems.start && comparisonItems.end && period !== "all_time") {
    const compareScoped = items.filter((t) => {
      const date = new Date(t.createdAt);
      return date >= comparisonItems.start! && date <= comparisonItems.end!;
    });
    const compareNet = sumSettledFlow(compareScoped).netFlow;
    if (compareNet === 0) {
      periodDeltaPct = netFlow > 0 ? 100 : netFlow < 0 ? -100 : 0;
    } else {
      periodDeltaPct = ((netFlow - compareNet) / Math.abs(compareNet)) * 100;
    }
  }

  const settledChronological = scoped
    .filter((t) => isTransactionSettled(t.status))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  let running = 0;
  const cumulative = settledChronological.map((t) => {
    const amount = Number(t.amount);
    running += t.type === "deposit" ? amount : -amount;
    return running;
  });

  const sparklineValues = cumulative.length > 0 ? sampleSeries(cumulative) : [];

  return {
    period,
    netFlow,
    moneyIn,
    moneyOut,
    transactionCount: scoped.length,
    settledCount,
    attentionCount,
    successRate,
    averageDeposit,
    periodDeltaPct,
    sparklineValues,
  };
}

export function getAttentionTransactions(items: Transaction[]): Transaction[] {
  return items
    .filter((t) => isAttentionStatus(t.status))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function searchTransactions(
  items: Transaction[],
  query: string,
): Transaction[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;

  return items.filter((t) => {
    const haystack = [
      t.reference,
      t.status,
      t.type,
      getActivityTransactionTitle(t),
      getPaymentMethodLabel(t),
      getPhoneLabel(t),
      String(t.amount),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export interface ActivitySummary {
  totalDeposits: number;
  totalWithdrawals: number;
  completedCount: number;
  pendingCount: number;
}

export function computeActivitySummary(items: Transaction[]): ActivitySummary {
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let completedCount = 0;
  let pendingCount = 0;

  for (const t of items) {
    const amount = Number(t.amount);
    const done = isTransactionSettled(t.status);
    if (done) completedCount += 1;
    else pendingCount += 1;

    if (t.type === "deposit" && done) totalDeposits += amount;
    if (t.type !== "deposit" && done) totalWithdrawals += amount;
  }

  return { totalDeposits, totalWithdrawals, completedCount, pendingCount };
}
