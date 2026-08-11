"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionRow } from "@/components/financial/transaction-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { depositApi, operationsApi } from "@/lib/api";
import { formatGhs, getGreeting } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { faCoins, faUsers, faWallet } from "@fortawesome/free-solid-svg-icons";
import {
  ArrowRight,
  UserPlus,
  Wallet,
  TrendingUp,
  ListChecks,
} from "@/components/icons/phosphor";
import { Button } from "@/components/ui/button";

export default function CollectorDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: summary } = useQuery({
    queryKey: ["collector-summary"],
    queryFn: () => operationsApi.getMySummary(),
    placeholderData: (prev) => prev,
  });

  const { data: deposits } = useQuery({
    queryKey: ["collector-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const transactions = deposits?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">
        {getGreeting()}, {user?.firstName}
      </h1>

      <div className="portal-metric-grid">
        <StatCard
          title="Collected Today"
          value={formatGhs(summary?.todayDepositsVolume ?? 0)}
          subtitle={`${summary?.todayDepositsCount ?? 0} deposits`}
          icon={faWallet}
          iconBgClassName="bg-primary/5 dark:bg-primary/10"
          iconClassName="text-foreground"
        />
        <StatCard
          title="This Week"
          value={formatGhs(summary?.weekDepositsVolume ?? 0)}
          subtitle={`${summary?.weekDepositsCount ?? 0} deposits`}
          icon={faWallet}
          iconBgClassName="dashboard-icon-sky"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="Customers"
          value={String(summary?.customerCount ?? 0)}
          icon={faUsers}
          iconBgClassName="dashboard-icon-sky"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="Commission"
          value={formatGhs(summary?.commissionBalance ?? 0)}
          subtitle={`${summary?.pendingDeposits ?? 0} pending`}
          icon={faCoins}
          iconBgClassName="dashboard-icon-violet"
          iconClassName="text-violet-600 dark:text-violet-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/collector/deposit">
          <Button className="w-full h-11 gap-2">
            <Wallet className="h-4 w-4" />
            Collect
          </Button>
        </Link>
        <Link href="/collector/customers">
          <Button variant="outline" className="w-full h-11 gap-2">
            <UserPlus className="h-4 w-4" />
            Customers
          </Button>
        </Link>
        <Link href="/collector/earnings">
          <Button variant="outline" className="w-full h-11 gap-2">
            <TrendingUp className="h-4 w-4" />
            Earnings
          </Button>
        </Link>
        <Link href="/collector/activity">
          <Button variant="outline" className="w-full h-11 gap-2">
            <ListChecks className="h-4 w-4" />
            Activity
          </Button>
        </Link>
      </div>

      <Card className="portal-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Collections</CardTitle>
          <Link
            href="/collector/deposits"
            className="text-sm text-primary flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="py-8 px-4 text-center text-sm text-muted-foreground">
              No collections yet. Tap <strong>Collect</strong> to start your
              first verified deposit.
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions.slice(0, 6).map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
