import type { Transaction } from "@/lib/api";

export type NotificationKind = "deposit" | "withdrawal";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  reference: string;
  transaction: Transaction;
}
