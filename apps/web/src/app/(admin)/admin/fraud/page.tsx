"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faFilter,
  faSpinner,
  faShield,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminFraudPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch tenants for filter
  const { data: tenantsData } = useQuery({
    queryKey: ["admin-tenants-list"],
    queryFn: () => adminApi.listTenants(),
  });

  // Fetch global fraud alerts
  const {
    data: fraudData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["admin-global-fraud", selectedTenant, selectedStatus],
    queryFn: () =>
      adminApi.listFraud({
        tenant_id: selectedTenant || undefined,
        status: selectedStatus || undefined,
      }),
  });

  const tenants = tenantsData?.items ?? [];
  const alerts = fraudData?.items ?? [];

  const getSeverityBadge = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev === "critical") {
      return (
        <span className="inline-flex items-center rounded-none bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
          Critical
        </span>
      );
    }
    if (sev === "high") {
      return (
        <span className="inline-flex items-center rounded-none bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          High
        </span>
      );
    }
    if (sev === "medium") {
      return (
        <span className="inline-flex items-center rounded-none bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-none bg-blue-500/10 text-blue-600 dark:text-foreground border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        Low
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const stat = status.toLowerCase();
    if (stat === "open") {
      return (
        <span className="inline-flex items-center rounded-none bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Open
        </span>
      );
    }
    if (stat === "investigating") {
      return (
        <span className="inline-flex items-center rounded-none bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Investigating
        </span>
      );
    }
    if (stat === "resolved") {
      return (
        <span className="inline-flex items-center rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-none bg-muted text-muted-foreground border border-border/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        False Positive
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="dashboard-title">Fraud & Security Alerts</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time risk scoring, suspicious pattern detection, and security
          incident monitoring.
        </p>
      </div>

      {/* Filter panel */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
              Filter By:
            </div>

            <div className="flex flex-1 flex-wrap gap-3">
              {/* Tenant filter */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full rounded-none border border-border/60 bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">All Organizations</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-none border border-border/60 bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
            </div>

            {isFetching && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="mr-1.5 h-3 w-3 animate-spin text-primary"
                />
                Updating...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Alerts List */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-bold">
            Security Risks & Fraud Flags ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded-none bg-muted/60"
                />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon
                icon={faShield}
                className="mx-auto h-8 w-8 text-emerald-600/50"
              />
              <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                No security alerts triggered.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The platform is running smoothly and all operations are secured.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase bg-muted/20">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Triggered Rule</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(alert.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-none bg-muted px-2 py-0.5 text-xs font-medium text-foreground border border-border/60">
                          {alert.tenant?.name || "Platform"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {alert.rule.replace(/_/g, " ")}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-foreground">
                          {alert.resourceType || "N/A"}
                        </span>
                        <span className="block text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                          {alert.resourceId || "N/A"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs">
                        {alert.details ? (
                          <div className="max-h-16 overflow-y-auto font-mono text-[10px] leading-tight bg-muted/20 p-1.5 rounded-none border border-border/60">
                            {JSON.stringify(alert.details, null, 2)}
                          </div>
                        ) : (
                          "No details provided"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {getStatusBadge(alert.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
