"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGhs } from "@/lib/utils";
import { PieChart as PieIcon } from "lucide-react";

interface CollectionsByStatusChartProps {
  transactions: Array<{
    id: string;
    amount: string | number;
    status: string;
    createdAt: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed: { label: "Completed", color: "#0066cc" }, // Primary Blue
  pending: { label: "Pending", color: "#f59e0b" }, // Warm Amber
  failed: { label: "Failed", color: "#ef4444" }, // Rose Red
  cancelled: { label: "Cancelled", color: "#64748b" }, // Slate Grey
};

export function CollectionsByStatusChart({
  transactions,
}: CollectionsByStatusChartProps) {
  const { data, total } = useMemo(() => {
    const buckets: Record<string, { amount: number; count: number }> = {
      completed: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      failed: { amount: 0, count: 0 },
      cancelled: { amount: 0, count: 0 },
    };
    let runningTotal = 0;

    for (const t of transactions) {
      const key = t.status || "completed";
      const amount = Number(t.amount);
      if (!buckets[key]) {
        buckets[key] = { amount: 0, count: 0 };
      }
      buckets[key].amount += amount;
      buckets[key].count += 1;
      runningTotal += amount;
    }

    const chartData = Object.entries(buckets)
      .filter(([_, data]) => data.count > 0) // Only include categories with items
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
    <Card className="col-span-1 lg:col-span-5 flex flex-col justify-between">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
            <PieIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Collections Status
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Distribution by transaction status
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
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
                        <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs">
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
                            color: "#e2e8f0",
                          },
                        ]
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={data.length > 1 ? 4 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {(data.length > 0
                    ? data
                    : [
                        {
                          name: "No data",
                          value: 1,
                          count: 0,
                          color: "#e2e8f0",
                        },
                      ]
                  ).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Vol.
              </span>
              <span className="text-sm font-bold text-foreground font-mono mt-0.5">
                {formatGhs(total)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-3.5 w-full">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">
                      {item.count} txn{item.count !== 1 ? "s" : ""} •{" "}
                      {formatGhs(item.value)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-foreground shrink-0 bg-muted/65 px-1.5 py-0.5 rounded text-[10px] font-mono">
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

        <div className="mt-2 flex items-center justify-center border-t border-border pt-3">
          <a
            href="/staff/deposits"
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            Manage Deposits Details →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
