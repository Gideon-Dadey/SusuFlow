import { cn, formatGhs } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: number | string;
  type?: "credit" | "debit" | "neutral";
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  className?: string;
}

export function MoneyDisplay({
  amount,
  type = "neutral",
  size = "md",
  showSign = false,
  className,
}: MoneyDisplayProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const sizes = {
    sm: "text-xs sm:text-sm font-bold tabular-nums",
    md: "text-sm sm:text-base font-bold tabular-nums",
    lg: "text-xl sm:text-2xl font-bold tracking-tight tabular-nums",
    xl: "text-3xl sm:text-4xl font-bold tracking-tight tabular-nums",
  };
  const colors = {
    credit: "text-foreground",
    debit: "text-foreground",
    neutral: "text-foreground",
  };

  const sign =
    showSign && type === "credit"
      ? "+"
      : showSign && type === "debit"
        ? "-"
        : "";

  return (
    <span className={cn(sizes[size], colors[type], className)}>
      {sign}
      {formatGhs(Math.abs(num))}
    </span>
  );
}
