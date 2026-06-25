import type { Transaction } from "@/lib/api";
import { isTransactionSettled } from "@/components/activity/transactionUtils";

export function getHomeGreeting(firstName: string): string {
  const hour = new Date().getHours();
  const name = firstName.trim() || "there";

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function formatHomeActivityDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getHomeTransactionTitle(transaction: Transaction): string {
  return transaction.type === "deposit" ? "Deposit" : "Withdrawal";
}

export type BalancePeriod = "this_month" | "last_month";

export const BALANCE_PERIOD_LABELS: Record<BalancePeriod, string> = {
  this_month: "This month",
  last_month: "Last month",
};

export const BALANCE_PERIOD_GROWTH_HINT: Record<BalancePeriod, string> = {
  this_month: "vs last month",
  last_month: "vs prior month",
};

function normalizeTransactions(
  transactions: Transaction[] | null | undefined,
): Transaction[] {
  return transactions ?? [];
}

function netTransactionAmount(transaction: Transaction): number {
  const amount = Number(transaction.amount);
  return transaction.type === "deposit" ? amount : -amount;
}

function getSettledTransactions(
  transactions: Transaction[] | null | undefined,
): Transaction[] {
  return normalizeTransactions(transactions).filter((txn) =>
    isTransactionSettled(txn.status),
  );
}

function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

function computeBalanceAt(
  transactions: Transaction[] | null | undefined,
  at: Date,
): number {
  return getSettledTransactions(transactions).reduce((balance, txn) => {
    if (new Date(txn.createdAt).getTime() <= at.getTime()) {
      return balance + netTransactionAmount(txn);
    }
    return balance;
  }, 0);
}

function sumNetSavingsInMonth(
  transactions: Transaction[] | null | undefined,
  year: number,
  month: number,
) {
  return getSettledTransactions(transactions).reduce((sum, txn) => {
    const date = new Date(txn.createdAt);
    if (date.getFullYear() === year && date.getMonth() === month) {
      return sum + netTransactionAmount(txn);
    }
    return sum;
  }, 0);
}

function getPeriodMonthBounds(period: BalancePeriod) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  if (period === "this_month") {
    return {
      currentMonth: thisMonth,
      currentYear: thisYear,
      compareMonth: thisMonth === 0 ? 11 : thisMonth - 1,
      compareYear: thisMonth === 0 ? thisYear - 1 : thisYear,
    };
  }

  const currentMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const currentYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  return {
    currentMonth,
    currentYear,
    compareMonth: currentMonth === 0 ? 11 : currentMonth - 1,
    compareYear: currentMonth === 0 ? currentYear - 1 : currentYear,
  };
}

export function computePeriodGrowth(
  transactions: Transaction[] | null | undefined,
  period: BalancePeriod,
): number | null {
  const { currentMonth, currentYear, compareMonth, compareYear } =
    getPeriodMonthBounds(period);

  const currentTotal = sumNetSavingsInMonth(
    transactions,
    currentYear,
    currentMonth,
  );
  const compareTotal = sumNetSavingsInMonth(
    transactions,
    compareYear,
    compareMonth,
  );

  if (compareTotal === 0) {
    return currentTotal > 0 ? 100 : null;
  }

  return ((currentTotal - compareTotal) / Math.abs(compareTotal)) * 100;
}

/** @deprecated Use computePeriodGrowth with `this_month` */
export function computeMonthOverMonthGrowth(transactions: Transaction[]) {
  return computePeriodGrowth(transactions, "this_month");
}

function sampleSeries(values: number[], maxPoints = 7) {
  if (values.length <= maxPoints) return values;

  const sampled: number[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i / (maxPoints - 1)) * (values.length - 1));
    sampled.push(values[index]);
  }
  return sampled;
}

export function hasSavingsSparklineData(values: number[]): boolean {
  if (values.length < 2) return false;
  return values.some((value) => value > 0);
}

export function buildPeriodSparklineValues(
  transactions: Transaction[] | null | undefined,
  period: BalancePeriod,
): number[] {
  const { currentMonth, currentYear } = getPeriodMonthBounds(period);
  const monthStart = getMonthStart(currentYear, currentMonth);
  const monthEnd = getMonthEnd(currentYear, currentMonth);

  const inMonth = getSettledTransactions(transactions)
    .filter((txn) => {
      const date = new Date(txn.createdAt);
      return (
        date.getFullYear() === currentYear && date.getMonth() === currentMonth
      );
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const openingBalance = computeBalanceAt(transactions, monthStart);

  if (!inMonth.length) {
    const closingBalance = computeBalanceAt(transactions, monthEnd);
    if (openingBalance <= 0 && closingBalance <= 0) {
      return [];
    }
    return [openingBalance, closingBalance];
  }

  const points: number[] = [openingBalance];
  let running = openingBalance;

  for (const txn of inMonth) {
    running += netTransactionAmount(txn);
    points.push(running);
  }

  return sampleSeries(points);
}

/** @deprecated Use buildPeriodSparklineValues with `this_month` */
export function buildSparklineValues(transactions: Transaction[]) {
  return buildPeriodSparklineValues(transactions, "this_month");
}
