"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auditApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-none bg-muted/60" />}
    >
      <AuditLogsContent />
    </Suspense>
  );
}

function AuditLogsContent() {
  const searchParams = useSearchParams();
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("");
  const userIdFilter = searchParams.get("userId") || "";

  const { data, isLoading } = useQuery({
    queryKey: [
      "staff-audit-logs",
      actionFilter,
      resourceTypeFilter,
      userIdFilter,
    ],
    queryFn: () =>
      auditApi.list({
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        userId: userIdFilter || undefined,
        limit: 50,
      }),
  });

  const logs = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Security & Operations Audit Logs</h1>
        {userIdFilter && (
          <p className="text-xs text-muted-foreground mt-1">
            Filtered to collector / user ID:{" "}
            <span className="font-mono text-xs font-semibold">
              {userIdFilter}
            </span>
          </p>
        )}
      </div>

      {/* Filters */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Filter by Action
            </label>
            <Input
              type="text"
              placeholder="e.g. user:login or customer:create"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-none border border-border/60 text-xs min-h-[38px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Filter by Resource Type
            </label>
            <Input
              type="text"
              placeholder="e.g. customer or transaction"
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="rounded-none border border-border/60 text-xs min-h-[38px]"
            />
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Activity Ledger Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No matching audit records found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const userName = log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : "System / Guest";
                    const userEmail = log.user?.email
                      ? ` (${log.user.email})`
                      : "";

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-foreground">
                          {userName}
                          <span className="block text-[10px] text-muted-foreground font-normal">
                            {userEmail}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono font-semibold text-foreground">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {log.resourceType}
                          </span>
                          {log.resourceId && (
                            <span className="block text-[10px] font-mono text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                              {log.resourceId}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                          {log.ipAddress || "Unknown"}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                          {log.userAgent || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
