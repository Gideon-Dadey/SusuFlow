"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { AdminDashboardHero } from "@/components/dashboard/admin-dashboard-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatGhs, formatDate, getInitials } from "@/lib/utils";
import {
  portalDashboardCardGridClass,
  portalDashboardMetricsGridClass,
} from "@/lib/portal-dashboard-tokens";
import {
  faBuilding,
  faCircleCheck,
  faTriangleExclamation,
  faWallet,
  faHistory,
  faShieldHalved,
  faUsers,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Fetch global metrics and summaries
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["admin-global-summary"],
    queryFn: () => adminApi.getGlobalSummary(),
    placeholderData: (prev) => prev,
  });

  // Fetch all tenants to allow quick actions
  const { data: tenantsData, isLoading: isTenantsLoading } = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: () => adminApi.listTenants(),
    placeholderData: (prev) => prev,
  });

  // Mutations for tenant quick actions
  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateTenant(id),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-global-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants-list"] });
      setTimeout(() => setActionMessage(null), 5000);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.suspendTenant(id, "Suspended by super administrator"),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-global-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants-list"] });
      setTimeout(() => setActionMessage(null), 5000);
    },
  });

  const isLoading = isSummaryLoading || isTenantsLoading;

  if (summaryError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="h-12 w-12 text-destructive"
        />
        <p className="text-sm font-medium text-destructive">
          Failed to fetch platform metrics. Verify that the API server is
          operational.
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin-global-summary"],
            })
          }
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const tenants = tenantsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Bimatro Hero Header Component */}
      <AdminDashboardHero
        greeting="Super Admin Control Center 👋"
        title="System Overview & Platform Controls"
        subtitle="Monitor real-time organizational deposits, ledger activities, and tenant access rules."
        highlight1Label="Active Tenants"
        highlight1Value={
          isLoading ? "..." : String(summary?.activeTenants ?? 0)
        }
        highlight2Label="Global Volume"
        highlight2Value={
          isLoading ? "..." : formatGhs(summary?.totalDeposits ?? 0)
        }
      />

      {actionMessage && (
        <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-foreground transition-all duration-300">
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="mr-2 text-emerald-500"
          />
          {actionMessage}
        </div>
      )}

      {/* Quick Action Grid (4-up on desktop) */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Quick Actions
        </h2>
        <div className={portalDashboardCardGridClass}>
          <QuickActionCard
            href="/admin/tenants/new"
            title="New Organization"
            description="Register tenant organization"
            icon={faPlus}
            iconBgClassName="bg-blue-500/10"
            iconClassName="text-blue-500"
          />
          <QuickActionCard
            href="/admin/deposits"
            title="Global Deposits"
            description="View all inbound payments"
            icon={faWallet}
            iconBgClassName="bg-emerald-500/10"
            iconClassName="text-emerald-500"
          />
          <QuickActionCard
            href="/admin/withdrawals"
            title="Disbursements"
            description="Process tenant claims"
            icon={faHistory}
            iconBgClassName="bg-amber-500/10"
            iconClassName="text-amber-500"
          />
          <QuickActionCard
            href="/admin/fraud"
            title="Security Center"
            description="Review platform alerts"
            icon={faShieldHalved}
            iconBgClassName="bg-red-500/10"
            iconClassName="text-red-500"
          />
        </div>
      </section>

      {/* Overview Metrics Grid (2x2 Mobile, 4-up Desktop) */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Key Metrics
        </h2>
        <div className={portalDashboardMetricsGridClass}>
          <StatCard
            title="Organizations"
            value={isLoading ? "..." : String(summary?.totalTenants ?? 0)}
            subtitle={
              isLoading ? undefined : `${summary?.activeTenants ?? 0} active`
            }
            icon={faBuilding}
            iconBgClassName="bg-indigo-500/10"
            iconClassName="text-indigo-500"
          />
          <StatCard
            title="Total Deposits"
            value={isLoading ? "..." : formatGhs(summary?.totalDeposits ?? 0)}
            subtitle="All organizations combined"
            icon={faWallet}
            iconBgClassName="bg-emerald-500/10"
            iconClassName="text-emerald-500"
          />
          <StatCard
            title="Total Withdrawals"
            value={
              isLoading ? "..." : formatGhs(summary?.totalWithdrawals ?? 0)
            }
            subtitle="Processed disbursements"
            icon={faHistory}
            iconBgClassName="bg-amber-500/10"
            iconClassName="text-amber-500"
          />
          <StatCard
            title="Fraud Alerts"
            value={isLoading ? "..." : String(summary?.openFraudAlerts ?? 0)}
            subtitle={
              summary?.openFraudAlerts && summary.openFraudAlerts > 0
                ? "Requires immediate action"
                : "System secured"
            }
            icon={faTriangleExclamation}
            iconBgClassName={
              summary?.openFraudAlerts && summary.openFraudAlerts > 0
                ? "bg-red-500/20 text-red-500"
                : "bg-slate-500/10"
            }
            iconClassName={
              summary?.openFraudAlerts && summary.openFraudAlerts > 0
                ? "text-red-500"
                : "text-slate-500"
            }
          />
        </div>
      </section>

      {/* Organization Status & Quick Management Card */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
              Organizations
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Quick action toggles for platform access control
            </p>
          </div>
          <Link href="/admin/tenants">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-secondary hover:text-secondary/80"
            >
              View All Orgs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-none bg-muted/60"
                />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No organizations registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {tenants.slice(0, 5).map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {tenant.name}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {tenant.slug}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium capitalize ${
                            tenant.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : tenant.status === "suspended"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {tenant.status !== "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs min-h-[32px] px-2.5 rounded-none"
                              disabled={
                                activateMutation.isPending ||
                                suspendMutation.isPending
                              }
                              onClick={() => activateMutation.mutate(tenant.id)}
                            >
                              Activate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs min-h-[32px] px-2.5 rounded-none border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                              disabled={
                                activateMutation.isPending ||
                                suspendMutation.isPending
                              }
                              onClick={() => suspendMutation.mutate(tenant.id)}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Activity & Security Trail (Ranked Bimatro List Containers) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Global Deposits & Withdrawals */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm lg:col-span-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/60">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
                Global Ledger Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time transactional log across all tenant accounts
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/deposits">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-secondary hover:text-secondary/80 h-7 px-2"
                >
                  Deposits
                </Button>
              </Link>
              <Link href="/admin/withdrawals">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-secondary hover:text-secondary/80 h-7 px-2"
                >
                  Withdrawals
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-none bg-muted/60"
                  />
                ))}
              </div>
            ) : !summary?.recentTransactions ||
              summary.recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No ledger transactions found.
              </p>
            ) : (
              summary.recentTransactions
                .slice(0, 6)
                .map((tx: any, idx: number) => {
                  const customerName = tx.customer?.user
                    ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                    : "Unknown Customer";
                  const customerEmail =
                    tx.customer?.user?.email || "No email registered";
                  const initials = getInitials(customerName);
                  const avatarUrl = tx.customer?.user?.avatarUrl;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setSelectedTxn(tx);
                        setReceiptOpen(true);
                      }}
                      className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-muted/30 cursor-pointer transition-colors gap-3"
                    >
                      {/* Left: Rank & Avatar */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-6 text-xs font-bold text-amber-500 shrink-0 text-center font-mono">
                          #{idx + 1}
                        </span>

                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-border/40">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={customerName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>

                        {/* Info block */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground truncate">
                              {customerName}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold px-2 py-0.5 text-muted-foreground uppercase border border-border/60">
                              {tx.type === "deposit" ? "SAVER" : "WITHDRAWAL"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                            {customerEmail}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 truncate font-mono mt-0.5">
                            Ref:{" "}
                            <span className="font-semibold">
                              {tx.reference}
                            </span>{" "}
                            · Org:{" "}
                            <span className="font-semibold text-foreground">
                              {tx.tenant?.name || "Platform"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Timestamp */}
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold tabular-nums tracking-tight text-foreground">
                          {tx.type === "deposit" ? "+" : "-"}
                          {formatGhs(tx.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Right Column: Platform Security Trail */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm lg:col-span-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/60">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
                System Security Trail
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live monitoring of user actions and admin overrides
              </p>
            </div>
            <Link href="/admin/audit">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-secondary hover:text-secondary/80 h-7 px-2"
              >
                View Logs
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/60">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-none bg-muted/60"
                  />
                ))}
              </div>
            ) : !summary?.recentAuditLogs ||
              summary.recentAuditLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No recent security events.
              </p>
            ) : (
              summary.recentAuditLogs
                .slice(0, 6)
                .map((log: any, idx: number) => {
                  const actorName = log.user
                    ? `${log.user.firstName} ${log.user.lastName}`
                    : "System / Webhook";
                  const actorEmail =
                    log.user?.email || "system@susuflow.internal";
                  const initials = getInitials(actorName);
                  const actionTitle = log.action
                    ? log.action.replace(/_/g, " ")
                    : "Action Logged";

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-muted/30 transition-colors gap-3"
                    >
                      {/* Left: Rank & Avatar */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-6 text-xs font-bold text-amber-500 shrink-0 text-center font-mono">
                          #{idx + 1}
                        </span>

                        <div className="size-9 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-border/40">
                          {initials}
                        </div>

                        {/* Info block */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground capitalize truncate">
                              {actionTitle}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold px-2 py-0.5 text-muted-foreground uppercase border border-border/60">
                              SECURITY
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                            Actor:{" "}
                            <span className="text-foreground font-semibold">
                              {actorName}
                            </span>{" "}
                            ({actorEmail})
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 truncate font-mono mt-0.5">
                            Resource:{" "}
                            <span className="font-semibold text-foreground">
                              {log.resourceType}
                            </span>{" "}
                            ({log.resourceId || "N/A"}) · Org:{" "}
                            <span className="font-semibold">
                              {log.tenant?.name || "Platform"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right: IP / Details & Timestamp */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {log.ipAddress || "INTERNAL"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </div>

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
