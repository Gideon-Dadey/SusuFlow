import type { SavingsPlan } from "@/lib/api";
import { formatGhs } from "@/lib/currency";

export function formatPlanFrequency(frequency: string): string {
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };
  return labels[frequency] ?? frequency.replace(/_/g, " ");
}

export function formatPlanAmountRange(plan: SavingsPlan): string {
  const min = formatGhs(Number(plan.minAmount));
  if (plan.maxAmount) {
    return `${min} – ${formatGhs(Number(plan.maxAmount))}`;
  }
  return `From ${min}`;
}

export function formatGoalStatus(status: string): string {
  if (status === "active") return "Active";
  if (status === "completed") return "Completed";
  if (status === "paused") return "Paused";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function sanitizeTargetAmount(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function parseTargetAmount(value: string): number | null {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
