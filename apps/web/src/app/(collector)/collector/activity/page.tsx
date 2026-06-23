"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { operationsApi } from "@/lib/api";

const ACTION_LABELS: Record<string, string> = {
  "customer:create": "Onboarded customer",
  "deposit:initiate": "Initiated collection",
  "user:login": "Signed in",
};

export default function CollectorActivityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["collector-activity"],
    queryFn: () => operationsApi.getMyActivity(),
  });

  const logs = data?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">Activity</h1>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted/50 m-4 rounded-lg" />
          ) : logs.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No activity logged yet. Actions will appear here as you onboard
              customers and collect deposits.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {logs.map(
                (log: {
                  id: string;
                  action: string;
                  resourceType: string;
                  resourceId?: string;
                  createdAt: string;
                  afterState?: Record<string, unknown>;
                }) => (
                  <div
                    key={log.id}
                    className="px-4 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {ACTION_LABELS[log.action] || log.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.resourceType}
                          {log.resourceId
                            ? ` · ${String(log.resourceId).slice(0, 8)}…`
                            : ""}
                        </p>
                        {log.afterState &&
                          typeof log.afterState === "object" &&
                          "amount" in log.afterState && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                              GHS {Number(log.afterState.amount).toFixed(2)}
                              {"reference" in log.afterState &&
                              log.afterState.reference
                                ? ` · ${String(log.afterState.reference)}`
                                : ""}
                            </p>
                          )}
                        {log.afterState &&
                          typeof log.afterState === "object" &&
                          "customerNumber" in log.afterState && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Customer {String(log.afterState.customerNumber)}
                            </p>
                          )}
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
