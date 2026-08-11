import type { Transaction } from "@/lib/api";

export type NotificationKind =
  | "deposit"
  | "withdrawal"
  | "kyc"
  | "security"
  | "account";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  amount?: number;
  currency: string;
  status: string;
  createdAt: string;
  reference: string;
  transaction?: Transaction;
  screen?: string;
  inboxId?: string;
  readAt?: string | null;
}
