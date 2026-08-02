import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { MoneyDisplay } from "./money-display";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/api";
import { cn } from "@/lib/utils";

export function TransactionRow({
  transaction,
  action,
  onClick,
  className,
}: {
  transaction: Transaction;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const isDeposit = transaction.type === "deposit";
  const amount = Number(transaction.amount);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 border-b border-border/60 py-3 px-2 transition-colors last:border-0",
        onClick && "cursor-pointer hover:bg-muted/20",
        className,
      )}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isDeposit
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-amber-500/10 text-amber-500"
        }`}
      >
        {isDeposit ? (
          <ArrowDownLeft className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs sm:text-sm font-semibold text-foreground">
          {isDeposit
            ? "Deposit"
            : transaction.type.charAt(0).toUpperCase() +
              transaction.type.slice(1)}
          {transaction.payment?.paymentMethod
            ? ` · ${transaction.payment.paymentMethod.replace(/_/g, " ")}`
            : ""}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3 text-right shrink-0">
        <div>
          <MoneyDisplay
            amount={amount}
            type={isDeposit ? "credit" : "debit"}
            showSign
            size="sm"
          />
          <div className="mt-1 flex justify-end">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>
    </div>
  );
}
