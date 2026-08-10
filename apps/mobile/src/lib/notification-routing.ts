import type { DepositDetail, Transaction } from "@/lib/api";
import { depositApi } from "@/lib/api";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
} from "@/lib/financial-queries";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { CustomerSessionScope } from "@/lib/query-keys";

export type NotificationRoute =
  | { kind: "receipt"; transaction: Transaction }
  | { kind: "kyc" }
  | { kind: "plans" }
  | { kind: "activity" }
  | { kind: "home" };

export type PushNotificationData = {
  type?: string;
  transactionId?: string;
  reference?: string;
  screen?: string;
};

/** Normalize Expo / FCM data bags (values are often strings). */
export function parsePushNotificationData(
  raw: Record<string, unknown> | undefined | null,
): PushNotificationData {
  if (!raw) return {};
  const read = (key: string) => {
    const value = raw[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  };
  return {
    type: read("type"),
    transactionId: read("transactionId") || read("transaction_id"),
    reference: read("reference"),
    screen: read("screen"),
  };
}

export function depositDetailToTransaction(detail: DepositDetail): Transaction {
  return {
    id: detail.id,
    reference: detail.reference,
    type: "deposit",
    status: detail.status,
    amount: detail.amount,
    currency: "GHS",
    createdAt: detail.createdAt,
    completedAt: detail.completedAt ?? undefined,
    payment: detail.payment
      ? {
          paymentMethod: detail.payment.paymentMethod || "mobile_money",
          status: detail.payment.status,
          payerPhone: detail.payment.payerPhone ?? undefined,
        }
      : undefined,
  };
}

function findCachedTransaction(
  session: CustomerSessionScope,
  transactionId: string,
): Transaction | null {
  const deposits = queryClient.getQueryData<{ items: Transaction[] }>(
    queryKeys.deposits(session.userId, session.customerId),
  );
  const withdrawals = queryClient.getQueryData<{ items: Transaction[] }>(
    queryKeys.withdrawals(session.userId, session.customerId),
  );
  const match =
    deposits?.items.find((item) => item.id === transactionId) ||
    withdrawals?.items.find((item) => item.id === transactionId) ||
    deposits?.items.find((item) => item.reference === transactionId) ||
    withdrawals?.items.find((item) => item.reference === transactionId);
  return match ?? null;
}

export async function resolveTransactionForDeepLink(
  session: CustomerSessionScope | null | undefined,
  data: PushNotificationData,
): Promise<Transaction | null> {
  const id = data.transactionId || data.reference;
  if (!id) return null;

  if (session) {
    const cached = findCachedTransaction(session, id);
    if (cached) return cached;
  }

  const type = (data.type || "").toLowerCase();
  const looksLikeDeposit =
    type.includes("deposit") || (!type.includes("withdrawal") && !!id);

  if (looksLikeDeposit) {
    try {
      const detail = await depositApi.get(id);
      return depositDetailToTransaction(detail);
    } catch {
      // Fall through — may be a withdrawal id without a GET endpoint.
    }
  }

  if (session) {
    try {
      const [deposits, withdrawals] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: queryKeys.deposits(session.userId, session.customerId),
          queryFn: () => fetchCustomerDeposits(session.customerId),
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.withdrawals(session.userId, session.customerId),
          queryFn: () => fetchCustomerWithdrawals(session.customerId),
        }),
      ]);
      return (
        deposits.items.find(
          (item) => item.id === id || item.reference === id,
        ) ||
        withdrawals.items.find(
          (item) => item.id === id || item.reference === id,
        ) ||
        null
      );
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveNotificationRouteFromPush(
  data: PushNotificationData,
): Exclude<NotificationRoute, { kind: "receipt" }> {
  const type = (data.type || "").toLowerCase();
  const screen = (data.screen || "").toLowerCase();

  if (screen === "kyc" || type.includes("kyc")) return { kind: "kyc" };
  if (screen === "plans" || screen === "goals" || type.includes("goal")) {
    return { kind: "plans" };
  }
  if (
    type.includes("deposit") ||
    type.includes("withdrawal") ||
    data.transactionId
  ) {
    return { kind: "activity" };
  }
  return { kind: "home" };
}
