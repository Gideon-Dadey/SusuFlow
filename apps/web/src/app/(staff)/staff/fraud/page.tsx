"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fraudApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function FraudAlertsPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("open");
  const [resolutionNotes, setResolutionNotes] = useState<
    Record<string, string>
  >({});
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["fraud-alerts", selectedStatus],
    queryFn: () => fraudApi.list(selectedStatus || undefined),
  });

  const resolveMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "resolved" | "false_positive";
      notes?: string;
    }) => fraudApi.resolve(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraud-alerts"] });
      setActiveAlertId(null);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Alert resolution failed");
    },
  });

  const handleResolve = async (
    id: string,
    status: "resolved" | "false_positive",
  ) => {
    const notes = resolutionNotes[id];
    setActiveAlertId(id);
    await resolveMutation.mutateAsync({ id, status, notes });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Fraud & Risk Alerts</h1>
        </div>

        <div className="flex items-center gap-2">
          {["open", "investigating", "resolved", ""].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? "primary" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className="text-xs font-semibold px-3 min-h-[36px] rounded-none"
            >
              {status === "" ? "ALL" : status.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card
              key={n}
              className="rounded-none border border-border/60 animate-pulse h-32"
            />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <Card className="p-8 text-center bg-card rounded-none border border-border/60">
          <p className="text-muted-foreground text-xs font-semibold">
            No risk alerts found matching filter
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 gap-4 border-b border-border/60 bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wider">
                      {alert.severity.toUpperCase()} RISK
                    </span>
                    <StatusBadge status={alert.status} />
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Rule ID: {alert.rule}
                    </span>
                  </div>
                  <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                    Suspected Anomaly Detected
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Triggered: {formatDate(alert.createdAt)}
                  </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-none border border-border/40 max-w-sm overflow-auto">
                  Resource: {alert.resourceType || "None"} /{" "}
                  {alert.resourceId || "N/A"}
                </div>
              </div>

              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="text-xs">
                  <span className="text-muted-foreground font-semibold">
                    Details Payload:
                  </span>
                  <pre className="mt-2 p-3 bg-muted/20 rounded-none border border-border/40 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(alert.details, null, 2)}
                  </pre>
                </div>

                {alert.status === "resolved" && alert.resolvedBy && (
                  <div className="p-3 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    Resolution Status: Resolved by {alert.resolvedBy.firstName}{" "}
                    {alert.resolvedBy.lastName} on{" "}
                    {alert.resolvedAt ? formatDate(alert.resolvedAt) : "N/A"}
                    {alert.details?.resolutionNotes && (
                      <p className="mt-1 font-normal text-muted-foreground">
                        Notes: {alert.details.resolutionNotes}
                      </p>
                    )}
                  </div>
                )}

                {alert.status === "open" && (
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        placeholder="Add resolution notes..."
                        value={resolutionNotes[alert.id] || ""}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({
                            ...prev,
                            [alert.id]: e.target.value,
                          }))
                        }
                        className="text-xs min-h-[38px] rounded-none border border-border/60 flex-1"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={
                            activeAlertId === alert.id &&
                            resolveMutation.isPending
                          }
                          onClick={() =>
                            handleResolve(alert.id, "false_positive")
                          }
                          className="text-xs font-semibold px-4 rounded-none min-h-[38px]"
                        >
                          False Positive
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={
                            activeAlertId === alert.id &&
                            resolveMutation.isPending
                          }
                          onClick={() => handleResolve(alert.id, "resolved")}
                          className="text-xs font-semibold px-4 rounded-none min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                        >
                          Resolve Alert
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
