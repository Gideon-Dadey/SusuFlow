"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { formatGhs, formatDate } from "@/lib/utils";
import {
  faBuilding,
  faCircleCheck,
  faTriangleExclamation,
  faWallet,
  faHistory,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
          Failed to fetch platform metrics. Verify that the NestJS API is
          operational.
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin-global-summary"],
            })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  const tenants = tenantsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="dashboard-title">Super Admin Control Center</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tenants/new">
            <Button size="sm">
              <FontAwesomeIcon
                icon={faBuilding}
                className="mr-1.5 h-3.5 w-3.5"
              />
              New Organization
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground transition-all duration-300">
          <FontAwesomeIcon icon={faCircleCheck} className="mr-2 text-primary" />
          {actionMessage}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="portal-metric-grid">
        <StatCard
          title="Total Organizations"
          value={isLoading ? "..." : String(summary?.totalTenants ?? 0)}
          subtitle={
            isLoading ? undefined : `${summary?.activeTenants ?? 0} active`
          }
          icon={faBuilding}
          iconBgClassName="bg-indigo-50 dark:bg-indigo-950/40"
          iconClassName="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Global Deposits Sum"
          value={isLoading ? "..." : formatGhs(summary?.totalDeposits ?? 0)}
          subtitle="All organizations combined"
          icon={faWallet}
          iconBgClassName="bg-emerald-50 dark:bg-emerald-950/40"
          iconClassName="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Global Withdrawals Sum"
          value={isLoading ? "..." : formatGhs(summary?.totalWithdrawals ?? 0)}
          subtitle="Processed disbursements"
          icon={faHistory}
          iconBgClassName="bg-amber-50 dark:bg-amber-950/40"
          iconClassName="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Open Fraud Alerts"
          value={isLoading ? "..." : String(summary?.openFraudAlerts ?? 0)}
          subtitle={
            summary?.openFraudAlerts && summary.openFraudAlerts > 0
              ? "Requires immediate action"
              : "System secured"
          }
          icon={faTriangleExclamation}
          iconBgClassName={
            summary?.openFraudAlerts && summary.openFraudAlerts > 0
              ? "bg-red-50 dark:bg-red-950/50 pulse-animation"
              : "bg-slate-50 dark:bg-slate-900"
          }
          iconClassName={
            summary?.openFraudAlerts && summary.openFraudAlerts > 0
              ? "text-red-600 dark:text-red-400"
              : "text-slate-600 dark:text-slate-400"
          }
          className={
            summary?.openFraudAlerts && summary.openFraudAlerts > 0
              ? "border-red-200 dark:border-red-900/40"
              : undefined
          }
        />
      </div>

      {/* Organization Status & Quick Management Card */}
      <Card className="portal-card border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Organizations</CardTitle>
            <p className="text-xs text-muted-foreground">
              Quick action toggles for platform access control
            </p>
          </div>
          <Link href="/admin/tenants">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-primary"
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
                  className="h-16 w-full animate-pulse rounded-lg bg-muted/65"
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
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
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
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            tenant.status === "active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                              : tenant.status === "suspended"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
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
                              className="h-8 text-xs min-h-[32px] px-2.5"
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
                              className="h-8 text-xs min-h-[32px] px-2.5 border-red-200 hover:bg-red-50 dark:border-red-950/50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
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

      {/* Two Column Grid: Transactions & Security Audits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Global Deposits & Withdrawals */}
        <Card className="portal-card border-border/60 lg:col-span-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Global Ledger Activity</CardTitle>
              <p className="text-xs text-muted-foreground">
                Latest transactions across all registered tenants
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/deposits">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-primary"
                >
                  Deposits
                </Button>
              </Link>
              <Link href="/admin/withdrawals">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-primary"
                >
                  Withdrawals
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-lg bg-muted/65"
                  />
                ))}
              </div>
            ) : !summary?.recentTransactions ||
              summary.recentTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No ledger transactions found.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.recentTransactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-foreground">
                          {tx.customer?.user
                            ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                            : "Unknown customer"}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono uppercase">
                          {tx.tenant?.name || "Platform"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {tx.reference} · {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {tx.type === "deposit" ? "+" : "-"}
                        {formatGhs(tx.amount)}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Platform Audit Logs */}
        <Card className="portal-card border-border/60 lg:col-span-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>System Security Trail</CardTitle>
              <p className="text-xs text-muted-foreground">
                Live monitoring of user actions and admin overrides
              </p>
            </div>
            <Link href="/admin/audit">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-primary"
              >
                View Logs
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-lg bg-muted/65"
                  />
                ))}
              </div>
            ) : !summary?.recentAuditLogs ||
              summary.recentAuditLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent security events.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.recentAuditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-lg border border-border p-3 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground capitalize">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
                      <span>
                        Actor:{" "}
                        <span className="font-medium text-foreground">
                          {log.user
                            ? `${log.user.firstName} ${log.user.lastName}`
                            : "System"}
                        </span>
                      </span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono uppercase">
                        {log.tenant?.name || "Platform"}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                      Resource: {log.resourceType} ({log.resourceId || "N/A"})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
