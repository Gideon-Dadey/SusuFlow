import type { AppIconName } from "@/components/icons/AppIcon";
import { MOBILE_MONEY_METHODS } from "@/components/payments/MobileMoneyMark";
import {
  parseDepositAmount,
  sanitizeAmountInput,
} from "@/components/deposit/depositUtils";

export type WithdrawStep = 0 | 1 | 2;

export const WITHDRAW_STEP_LABELS = [
  "Amount",
  "Destination",
  "Confirm",
] as const;

export const QUICK_WITHDRAW_FRACTIONS = [0.25, 0.5, 0.75, 1] as const;

export interface WithdrawMethodOption {
  id: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
}

export const WITHDRAW_METHODS: WithdrawMethodOption[] =
  MOBILE_MONEY_METHODS.map((item) => ({
    id: item.id,
    label: item.label,
    subtitle: item.subtitle,
    icon: "smartphone" as AppIconName,
  }));

export const parseWithdrawAmount = parseDepositAmount;
export { sanitizeAmountInput };

export function getWithdrawMethodLabel(methodId: string): string {
  return WITHDRAW_METHODS.find((m) => m.id === methodId)?.label ?? methodId;
}

export function formatWithdrawFractionLabel(fraction: number): string {
  if (fraction >= 1) return "Max";
  return `${Math.round(fraction * 100)}%`;
}

export function amountFromFraction(
  balance: number | undefined,
  fraction: number,
): string {
  if (!balance || balance <= 0) return "";
  const raw = balance * fraction;
  const rounded = Math.floor(raw * 100) / 100;
  if (rounded <= 0) return "";
  return rounded.toFixed(2);
}
