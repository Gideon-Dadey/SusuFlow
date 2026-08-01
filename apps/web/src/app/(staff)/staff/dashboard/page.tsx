"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { CollectionTrendChart } from "@/components/dashboard/collection-trend-chart";
import { CollectionsByStatusChart } from "@/components/dashboard/collections-by-status-chart";
import { TransactionRow } from "@/components/financial/transaction-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { depositApi, customerApi, operationsApi } from "@/lib/api";
import { formatGhs, getInitials, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import {
  faChartLine,
  faClipboardList,
  faUsers,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowRight, UserPlus, Wallet, Users } from "lucide-react";

export default function StaffDashboard() {
  const { data: deposits } = useQuery({
    queryKey: ["staff-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const { data: activeCustomers } = useQuery({
    queryKey: ["staff-active-customers"],
    queryFn: () => customerApi.list({ status: "active" }),
    placeholderData: (prev) => prev,
  });

  const { data: allCustomers } = useQuery({
    queryKey: ["staff-all-customers"],
    queryFn: () => customerApi.list(),
    placeholderData: (prev) => prev,
  });

  const { data: queue } = useQuery({
    queryKey: ["staff-action-queue"],
    queryFn: () => operationsApi.getQueue(),
    placeholderData: (prev) => prev,
    refetchInterval: 60_000,
  });

  const transactions = deposits?.items || [];
  const recentCustomers = allCustomers?.items || [];
  const todayDeposits = transactions.filter(
    (t) =>
      t.status === "completed" &&
      new Date(t.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayTotal = todayDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const pendingActions = queue?.summary?.total ?? 0;

  const quickActions = [
    {
      href: "/staff/deposits",
      label: "Manual Payments",
      subtitle: "Verify MoMo claims",
      icon: Wallet,
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      href: "/staff/customers/new",
      label: "Onboard Customer",
      subtitle: "Register new account",
      icon: UserPlus,
      bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      href: "/staff/withdrawals",
      label: "Review Withdrawals",
      subtitle: "Process claims & payouts",
      icon: Wallet,
      bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      href: "/staff/team",
      label: "Agent Approvals",
      subtitle: "Review registrations",
      icon: Users,
      bg: "bg-[#0066cc]/10 text-[#0066cc] dark:text-[#38bdf8]",
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-6">
      <div className="page-header hidden sm:block">
        <h1>Company Overview</h1>
      </div>

      <div className="portal-metric-grid">
        <StatCard
          title="Deposits Today"
          value={formatGhs(todayTotal)}
          icon={faWallet}
          iconBgClassName="bg-[#0066cc]/10 dark:bg-[#0066cc]/20"
          iconClassName="text-[#0066cc] dark:text-[#38bdf8]"
        />
        <StatCard
          title="Active Customers"
          value={String(activeCustomers?.items?.length || 0)}
          icon={faUsers}
          iconBgClassName="dashboard-icon-sky"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <Link href="/staff/queue" className="block">
          <StatCard
            title="Pending Actions"
            value={String(pendingActions)}
            icon={faClipboardList}
            iconBgClassName="dashboard-icon-amber"
            iconClassName="text-amber-600 dark:text-amber-400"
            subtitle={
              pendingActions > 0 ? "Needs your attention" : "All caught up"
            }
          />
        </Link>
        <StatCard
          title="Total Volume"
          value={formatGhs(
            transactions
              .filter((t) => t.status === "completed")
              .reduce((s, t) => s + Number(t.amount), 0),
          )}
          icon={faChartLine}
          iconBgClassName="dashboard-icon-violet"
          iconClassName="text-violet-600 dark:text-violet-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <CollectionTrendChart transactions={transactions} />
        <CollectionsByStatusChart transactions={transactions} />
      </div>

      {/* Elevated Pop-Up Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold tracking-tight text-foreground uppercase text-muted-foreground/80">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="block group">
              <Card className="p-4 h-full transition-all duration-200 border border-border bg-card">
                <div
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center mb-3",
                    action.bg,
                  )}
                >
                  <action.icon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                  {action.subtitle}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-12">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FontAwesomeIcon
                icon={faClipboardList}
                className="h-4 w-4 text-amber-500"
              />
              Action Queue
            </CardTitle>
            <Link href="/staff/queue">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!queue || queue.summary.total === 0 ? (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">
                No pending actions &mdash; you&apos;re all caught up
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {queue.items.slice(0, 5).map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href="/staff/queue"
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {item.amount != null && (
                        <span className="text-xs font-semibold">
                          {formatGhs(item.amount)}
                        </span>
                      )}
                      <StatusBadge status={item.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">
                No deposits yet
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border/40">
                {transactions.slice(0, 6).map((t) => (
                  <TransactionRow key={t.id} transaction={t} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!recentCustomers || recentCustomers.length === 0 ? (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">
                No customers onboarded yet
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border/40">
                {recentCustomers.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/staff/customers/${c.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary font-semibold text-xs">
                        {c.user?.avatarUrl ? (
                          <img
                            src={c.user.avatarUrl}
                            alt={`${c.user?.firstName || "Customer"} Avatar`}
                            className="size-full object-cover"
                          />
                        ) : (
                          getInitials(c.user?.firstName, c.user?.lastName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {c.user?.firstName || "Pending"}{" "}
                          {c.user?.lastName || "Onboarding"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {c.customerNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={c.status} />
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-semibold">
                        KYC L{c.kycLevel}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
