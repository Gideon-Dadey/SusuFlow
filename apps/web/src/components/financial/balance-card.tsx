import { Card, CardContent } from "@/components/ui/card";
import { MoneyDisplay } from "./money-display";
import { Button } from "@/components/ui/button";
import { TrendingUp, PlusCircle } from "@/components/icons/phosphor";
import Link from "next/link";

interface BalanceCardProps {
  balance: number;
  todayChange?: number;
  depositHref?: string;
}

export function BalanceCard({
  balance,
  todayChange,
  depositHref = "/deposit",
}: BalanceCardProps) {
  return (
    <Card className="relative overflow-hidden border border-blue-500/20 bg-gradient-to-br from-[#0f172a] via-[#00388c] to-[#0056d2] text-white">
      {/* Background Decorative Lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/80">
            Total Savings
          </p>
        </div>

        <div className="mt-3">
          <MoneyDisplay
            amount={balance}
            size="xl"
            className="text-white font-extrabold tracking-tight"
          />
        </div>

        {todayChange !== undefined && todayChange > 0 ? (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-400/20 border border-blue-400/30 text-xs font-medium text-blue-100">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{todayChange.toFixed(2)} GHS today</span>
          </div>
        ) : null}

        <Link href={depositHref} className="mt-6 block">
          <Button className="w-full h-11 bg-white text-[#00388c] hover:bg-blue-50 font-bold transition-all gap-2">
            <PlusCircle className="h-4 w-4 text-[#00388c]" />
            Make a Deposit
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
