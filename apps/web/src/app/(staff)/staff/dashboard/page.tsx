"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { AdminDashboardHero } from "@/components/dashboard/admin-dashboard-hero";
import { CollectionTrendChart } from "@/components/dashboard/collection-trend-chart";
import { CollectionsByStatusChart } from "@/components/dashboard/collections-by-status-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { depositApi, customerApi, operationsApi } from "@/lib/api";
import { formatGhs, getInitials, formatDate, getGreeting } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import {
  portalDashboardCardGridClass,
  portalDashboardMetricsGridClass,
} from "@/lib/portal-dashboard-tokens";
import {
  faChartLine,
  faClipboardList,
  faUsers,
  faWallet,
  faUserPlus,
  faCheckCircle,
  faSignal,
  faArrowRight,
  faCircleDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { useState } from "react";

export default function StaffDashboard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

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
  const queueItems = queue?.items || [];

  const todayDeposits = transactions.filter(
    (t) =>
      t.status === "completed" &&
      new Date(t.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayTotal = todayDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const pendingActionsCount = queue?.summary?.total ?? 0;

  // Activation mutation for pending accounts in queue
  const activateCustomerMutation = useMutation({
    mutationFn: (id: string) => customerApi.activate(id),
    onSuccess: () => {
      setActionSuccess("Customer account approved & activated successfully!");
      queryClient.invalidateQueries({ queryKey: ["staff-all-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-active-customers"] });
      queryClient.invalidateQueries({ queryKey: ["staff-action-queue"] });
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  return (
    <div className="space-y-6">
      {/* 1. Staff Hero Welcome Header */}
      <AdminDashboardHero
        greeting={`${getGreeting()}, ${user?.firstName || "Staff Member"} 👋`}
        title="Staff Operations Control Center"
        subtitle="Monitor real-time deposit collections, member onboarding, and action queues."
        highlight1Label="Today's Collections"
        highlight1Value={formatGhs(todayTotal)}
        highlight2Label="Pending Approvals"
        highlight2Value={String(pendingActionsCount)}
      />

      {actionSuccess && (
        <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] sm:text-sm text-foreground transition-all duration-300">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="mr-1.5 text-emerald-500"
          />
          {actionSuccess}
        </div>
      )}

      {/* 3. Metric Overview Cards Grid */}
      <section className="space-y-1 sm:space-y-2">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">
          Key Performance Metrics
        </h2>
        <div className={portalDashboardMetricsGridClass}>
          <StatCard
            title="Deposits Today"
            value={formatGhs(todayTotal)}
            subtitle={`${todayDeposits.length} transactions today`}
            icon={faWallet}
            iconBgClassName="bg-emerald-500/10"
            iconClassName="text-emerald-500"
          />
          <StatCard
            title="Active Customers"
            value={String(activeCustomers?.items?.length || 0)}
            subtitle={`${allCustomers?.items?.length || 0} total registered`}
            icon={faUsers}
            iconBgClassName="bg-sky-500/10"
            iconClassName="text-sky-500"
          />
          <Link href="/staff/queue" className="block">
            <StatCard
              title="Pending Actions"
              value={String(pendingActionsCount)}
              icon={faClipboardList}
              iconBgClassName="bg-amber-500/10"
              iconClassName="text-amber-500"
              subtitle={
                pendingActionsCount > 0
                  ? "Requires staff review"
                  : "All caught up"
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
            subtitle="Processed volume"
            icon={faChartLine}
            iconBgClassName="bg-indigo-500/10"
            iconClassName="text-indigo-500"
          />
        </div>
      </section>

      {/* 4. Quick Actions Grid (4-column) */}
      <section className="space-y-1 sm:space-y-2">
        <h2 className="text-sm sm:text-base font-semibold text-foreground">
          Quick Controls
        </h2>
        <div className={portalDashboardCardGridClass}>
          <QuickActionCard
            href="/staff/deposits"
            title="Manual Payments"
            description="Verify MoMo claims"
            icon={faWallet}
            iconBgClassName="bg-amber-500/10"
            iconClassName="text-amber-500"
          />
          <QuickActionCard
            href="/staff/customers/new"
            title="Onboard Customer"
            description="Register new account"
            icon={faUserPlus}
            iconBgClassName="bg-sky-500/10"
            iconClassName="text-sky-500"
          />
          <QuickActionCard
            href="/staff/withdrawals"
            title="Review Withdrawals"
            description="Process payouts & claims"
            icon={faWallet}
            iconBgClassName="bg-indigo-500/10"
            iconClassName="text-indigo-500"
          />
          <QuickActionCard
            href="/staff/team"
            title="Agent Approvals"
            description="Review field registrations"
            icon={faUsers}
            iconBgClassName="bg-emerald-500/10"
            iconClassName="text-emerald-500"
          />
        </div>
      </section>

      {/* 5. Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <CollectionTrendChart transactions={transactions} />
        <CollectionsByStatusChart transactions={transactions} />
      </div>

      {/* 6. Two-Column Row: Priority Queue & Recent Onboarded Members (Bimatro Leaderboard Layout) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Priority Operations Queue */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden lg:col-span-6">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/60">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              Priority Action Queue
            </h3>
            <Link
              href="/staff/queue"
              className="text-xs sm:text-sm font-semibold text-secondary hover:underline transition-colors"
            >
              Full Queue →
            </Link>
          </div>

          {queueItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="mx-auto h-7 w-7 text-emerald-500 mb-2 block"
              />
              No pending queue items. All operational actions up to date.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {queueItems.slice(0, 6).map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                    <span
                      className={`text-xs sm:text-sm font-bold shrink-0 w-6 text-center ${idx < 3 ? "text-amber-500" : "text-muted-foreground"}`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs">
                      <FontAwesomeIcon
                        icon={faClipboardList}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground capitalize">
                          {item.type.replace(/_/g, " ")}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                          Pending
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.description || "Requires staff approval"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Link href={`/staff/queue?highlight=${item.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] px-2.5 rounded-none"
                      >
                        Review
                      </Button>
                    </Link>
                    <p className="mt-1 text-[10px] text-muted-foreground font-mono">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right Column: Newly Registered Susu Members */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden lg:col-span-6">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/60">
            <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              Recent Onboarded Members
            </h3>
            <Link
              href="/staff/customers"
              className="text-xs sm:text-sm font-semibold text-secondary hover:underline transition-colors"
            >
              All Members →
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No members registered yet.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {recentCustomers.slice(0, 6).map((customer, idx: number) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                    <span
                      className={`text-xs sm:text-sm font-bold shrink-0 w-6 text-center ${idx < 3 ? "text-amber-500" : "text-muted-foreground"}`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-xs">
                      {getInitials(
                        customer.user?.firstName,
                        customer.user?.lastName,
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {customer.user?.firstName} {customer.user?.lastName}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted/60 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                          MEMBER
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                        {customer.customerNumber} ·{" "}
                        {customer.user?.phone ||
                          customer.user?.email ||
                          "No contact"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <StatusBadge status={customer.status} />
                    <Link href={`/staff/customers/${customer.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-secondary hover:text-secondary/80"
                      >
                        Profile →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 7. Live Activity Log: Recent Deposits (Bimatro Layout) */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/60">
          <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
            Recent Deposits Log
          </h3>
          <Link
            href="/staff/deposits"
            className="text-xs sm:text-sm font-semibold text-secondary hover:underline transition-colors"
          >
            View all
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No deposit transactions recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {transactions.slice(0, 8).map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  setSelectedTxn(tx);
                  setReceiptOpen(true);
                }}
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-foreground tracking-tight">
                      {tx.reference}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {tx.customer?.user
                      ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                      : "Susu Member"}{" "}
                    · {tx.customer?.customerNumber || "N/A"}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {formatGhs(tx.amount)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transaction Receipt Modal */}
      {receiptOpen && selectedTxn && (
        <ReceiptModal
          open={receiptOpen}
          transaction={selectedTxn}
          onClose={() => {
            setReceiptOpen(false);
            setSelectedTxn(null);
          }}
        />
      )}
    </div>
  );
}
