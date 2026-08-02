"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatGhs } from "@/lib/utils";

interface CollectionTrendChartProps {
  transactions: Array<{
    id: string;
    amount: string | number;
    status: string;
    createdAt: string;
  }>;
}

type Period = "7d" | "14d" | "30d";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
};

function getDaysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-none border border-border/60 bg-card p-3 shadow-md text-xs">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        Collections:{" "}
        <span className="font-semibold text-secondary">
          {formatGhs(payload[0].value)}
        </span>
      </p>
    </div>
  );
}

export function CollectionTrendChart({
  transactions,
}: CollectionTrendChartProps) {
  const [period, setPeriod] = useState<Period>("7d");

  const days = period === "30d" ? 30 : period === "14d" ? 14 : 7;

  const { chartData, total } = useMemo(() => {
    const cutoff = getDaysAgo(days);
    const completed = transactions.filter(
      (t) => t.status === "completed" && new Date(t.createdAt) >= cutoff,
    );

    const buckets = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = getDaysAgo(i);
      buckets.set(formatDayLabel(d), 0);
    }

    let runningTotal = 0;
    for (const t of completed) {
      const key = formatDayLabel(new Date(t.createdAt));
      const amount = Number(t.amount);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + amount);
      }
      runningTotal += amount;
    }

    return {
      chartData: Array.from(buckets.entries()).map(([name, value]) => ({
        name,
        value,
      })),
      total: runningTotal,
    };
  }, [transactions, days]);

  return (
    <Card className="col-span-1 lg:col-span-6">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Collection Trend
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatGhs(total)}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-none border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground outline-none transition hover:border-border focus:outline-none"
        >
          {Object.entries(PERIOD_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-card text-foreground">
              {label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="collectionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#153e90" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#153e90" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) =>
                  v >= 1000
                    ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`
                    : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#153e90"
                strokeWidth={2.5}
                fill="url(#collectionGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  fill: "#153e90",
                  stroke: "var(--background)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <a
            href="/staff/reports"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View full analytics →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
