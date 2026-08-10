import type { AppIconName } from "@/components/icons/AppIcon";
import { MOBILE_MONEY_METHODS } from "@/components/payments/MobileMoneyMark";
import {
  GHANA_BANKS,
  findGhanaBank,
  isMobileMoneyDepositMethod,
} from "@susuflow/shared/client";

export type DepositStep = 0 | 1 | 2;

export const DEPOSIT_STEP_LABELS = ["Amount", "Method", "Confirm"] as const;

export const QUICK_DEPOSIT_AMOUNTS = [10, 20, 50, 100] as const;

export interface DepositMethodOption {
  id: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
  group: "momo" | "bank";
}

export const DEPOSIT_METHODS: DepositMethodOption[] = [
  ...MOBILE_MONEY_METHODS.map((item) => ({
    id: item.id,
    label: item.label,
    subtitle: item.subtitle,
    icon: "smartphone" as AppIconName,
    group: "momo" as const,
  })),
  {
    id: "bank_transfer",
    label: "Bank transfer",
    subtitle: "Pay from your Ghana bank account",
    icon: "building",
    group: "bank",
  },
];

export const DEPOSIT_BANKS = GHANA_BANKS;

export function parseDepositAmount(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function sanitizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function getDepositMethodLabel(methodId: string): string {
  return DEPOSIT_METHODS.find((m) => m.id === methodId)?.label ?? methodId;
}

export function getDepositBankLabel(
  bankCode: string | null | undefined,
): string {
  return findGhanaBank(bankCode)?.name ?? bankCode ?? "Bank";
}

export function isDepositMobileMoney(methodId: string): boolean {
  return isMobileMoneyDepositMethod(methodId);
}

export function isDepositBankTransfer(methodId: string): boolean {
  return methodId === "bank_transfer";
}
