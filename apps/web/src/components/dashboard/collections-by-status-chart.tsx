"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGhs } from "@/lib/utils";
import { PieChart as PieIcon } from "@/components/icons/phosphor";

interface CollectionsByStatusChartProps {
  transactions: Array<{
    id: string;
    amount: string | number;
    status: string;
  }>;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badgeVariant: string }
> = {
  completed: {
    label: "Completed",
    color: "#10b981",
    badgeVariant: "success",
  },
  pending: { label: "Pending", color: "#f59e0b", badgeVariant: "warning" },
  failed: { label: "Failed", color: "#ef4444", badgeVariant: "danger" },
  rejected: { label: "Rejected", color: "#f43f5e", badgeVariant: "danger" },
  offline_pending: {
    label: "Offline Queue",
    color: "#8b5cf6",
    badgeVariant: "info",
  },
};

export function CollectionsByStatusChart({
  transactions,
}: CollectionsByStatusChartProps) {
  const { data, total } = useMemo(() => {
    const counts = new Map<string, { count: number; amount: number }>();
    let runningTotal = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      runningTotal += amount;
      const status = t.status || "pending";
      const existing = counts.get(status) || { count: 0, amount: 0 };
      counts.set(status, {
        count: existing.count + 1,
        amount: existing.amount + amount,
      });
    }

    const chartData = Array.from(counts.entries())
      .map(([status, item]) => ({
        name: STATUS_CONFIG[status]?.label || status,
        value: item.amount,
        count: item.count,
        color: STATUS_CONFIG[status]?.color || "#94a3b8",
        percentage:
          runningTotal > 0
            ? ((item.amount / runningTotal) * 100).toFixed(0)
            : "0",
      }))
      .sort((a, b) => b.value - a.value);

    return { data: chartData, total: runningTotal };
  }, [transactions]);

  return (
    <Card className="col-span-1 lg:col-span-6 flex flex-col justify-between p-0 overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">
            Collections Status
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Distribution by transaction status
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-2 pb-2 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8 my-auto">
          {/* Donut chart */}
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      if (item.name === "No data") return null;
                      return (
                        <div className="rounded-none border border-border/60 bg-card p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-foreground">
                            {item.name}
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            Volume:{" "}
                            <span className="font-mono font-medium text-foreground">
                              {formatGhs(item.value)}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Count:{" "}
                            <span className="font-medium text-foreground">
                              {item.count} txns
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={
                    data.length > 0
                      ? data
                      : [
                          {
                            name: "No data",
                            value: 1,
                            count: 0,
                            color: "#5c6b7f",
                          },
                        ]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={data.length > 1 ? 3 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.length > 0 ? (
                    data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  ) : (
                    <Cell fill="var(--border)" />
                  )}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Vol.
              </span>
              <span className="text-xs font-bold text-foreground tabular-nums truncate max-w-[130px]">
                {formatGhs(total)}
              </span>
            </div>
          </div>

          {/* Breakdown items */}
          <div className="w-full space-y-2.5">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.count} txn{item.count !== 1 ? "s" : ""} •{" "}
                      {formatGhs(item.value)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-foreground shrink-0 bg-muted/30 border border-border/40 px-1.5 py-0.5 rounded-none text-[10px] font-mono">
                  {item.percentage}%
                </span>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-xs text-center py-6 text-muted-foreground">
                No transaction data recorded
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <div className="border-t border-border/60 py-3 text-center bg-card">
        <a
          href="/staff/deposits"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          Manage Deposits Details →
        </a>
      </div>
    </Card>
  );
}
