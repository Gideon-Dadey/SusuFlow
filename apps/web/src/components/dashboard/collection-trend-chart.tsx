"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons/phosphor";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatGhs } from "@/lib/utils";

type TrendTxn = {
  amount: string | number;
  status: string;
  type?: string;
  createdAt: string;
  payment?: { paymentMethod?: string };
  withdrawal?: { disbursementMethod?: string };
};

type Period = "7d" | "30d" | "90d";
type View = "method" | "flow";

const PERIOD_DAYS: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const METHOD_SERIES = [
  { key: "momo", label: "Mobile money", color: "#2a9d8f" },
  { key: "bank", label: "Bank", color: "#6b5ce7" },
  { key: "cash", label: "Cash", color: "#c27803" },
  { key: "other", label: "Other", color: "#64748b" },
] as const;

const FLOW_SERIES = [
  { key: "inflow", label: "Collections", color: "#6b5ce7" },
  { key: "outflow", label: "Payouts", color: "#0f766e" },
] as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatTick(date: Date) {
  return `${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`;
}

function compactAxis(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
}

function methodKey(txn: TrendTxn): (typeof METHOD_SERIES)[number]["key"] {
  const raw = (
    txn.payment?.paymentMethod ||
    txn.withdrawal?.disbursementMethod ||
    ""
  ).toLowerCase();
  if (raw.includes("bank")) return "bank";
  if (raw.includes("cash")) return "cash";
  if (raw.includes("momo") || raw.includes("mobile")) return "momo";
  return raw ? "other" : "momo";
}

function isInflow(txn: TrendTxn) {
  return (txn.type || "deposit") !== "withdrawal";
}

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: string;
  series: ReadonlyArray<{ key: string; label: string; color: string }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="company-chart-tooltip">
      <p className="company-chart-tooltip-label">{label}</p>
      {series.map((item) => {
        const point = payload.find((entry) => entry.dataKey === item.key);
        const value = Number(point?.value || 0);
        if (!value) return null;
        return (
          <p key={item.key} className="company-chart-tooltip-row">
            <span
              className="company-chart-swatch"
              style={{ background: item.color }}
            />
            <span>{item.label}</span>
            <span className="company-chart-tooltip-value">
              {formatGhs(value)}
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function CollectionTrendChart({
  transactions,
}: {
  transactions: TrendTxn[];
}) {
  const [view, setView] = useState<View>("method");
  const [period, setPeriod] = useState<Period>("30d");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const days = PERIOD_DAYS[period];
  const series = view === "method" ? METHOD_SERIES : FLOW_SERIES;

  useEffect(() => {
    if (!periodOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!periodRef.current?.contains(event.target as Node)) {
        setPeriodOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPeriodOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [periodOpen]);

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const cutoff = addDays(today, -(days - 1));
    const useWeeks = days > 30;
    const step = useWeeks ? 7 : 1;
    const buckets: Array<{
      name: string;
      start: number;
      end: number;
      momo: number;
      bank: number;
      cash: number;
      other: number;
      inflow: number;
      outflow: number;
    }> = [];

    for (
      let cursor = new Date(cutoff);
      cursor <= today;
      cursor = addDays(cursor, step)
    ) {
      const start = startOfDay(cursor);
      const end = addDays(start, step);
      buckets.push({
        name: formatTick(start),
        start: start.getTime(),
        end: end.getTime(),
        momo: 0,
        bank: 0,
        cash: 0,
        other: 0,
        inflow: 0,
        outflow: 0,
      });
    }

    for (const txn of transactions) {
      if (txn.status !== "completed") continue;
      const stamp = new Date(txn.createdAt).getTime();
      if (stamp < cutoff.getTime()) continue;
      const bucket = buckets.find(
        (row) => stamp >= row.start && stamp < row.end,
      );
      if (!bucket) continue;
      const amount = Number(txn.amount) || 0;
      if (isInflow(txn)) {
        bucket.inflow += amount;
        bucket[methodKey(txn)] += amount;
      } else {
        bucket.outflow += amount;
      }
    }

    return buckets.map(({ start: _s, end: _e, ...row }) => row);
  }, [transactions, days]);

  return (
    <section className="company-panel company-chart">
      <div className="company-chart-toolbar">
        <h3 className="company-panel-title">Collection trend</h3>

        <div className="company-chart-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === "method"}
            className={`company-chart-tab ${view === "method" ? "is-active" : ""}`}
            onClick={() => setView("method")}
          >
            Method
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "flow"}
            className={`company-chart-tab ${view === "flow" ? "is-active" : ""}`}
            onClick={() => setView("flow")}
          >
            Flow
          </button>
        </div>

        <div ref={periodRef} className="company-chart-period">
          <button
            type="button"
            className="company-chart-period-trigger"
            aria-haspopup="listbox"
            aria-expanded={periodOpen}
            onClick={() => setPeriodOpen((open) => !open)}
          >
            {PERIOD_LABELS[period]}
            <ChevronDown className="h-3.5 w-3.5" weight="bold" />
          </button>
          {periodOpen ? (
            <ul className="company-chart-period-menu" role="listbox">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(
                ([key, label]) => (
                  <li key={key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={period === key}
                      className={`company-chart-period-option ${period === key ? "is-active" : ""}`}
                      onClick={() => {
                        setPeriod(key);
                        setPeriodOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="company-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap="28%"
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--company-line)"
              strokeOpacity={0.9}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={days === 30 ? 4 : 0}
              tick={{ fill: "var(--company-muted)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={36}
              tick={{ fill: "var(--company-muted)", fontSize: 11 }}
              tickFormatter={compactAxis}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              content={<ChartTooltip series={series} />}
            />
            {series.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                stackId={view === "method" ? "methods" : undefined}
                fill={item.color}
                maxBarSize={28}
                radius={
                  view === "flow" || index === series.length - 1
                    ? [3, 3, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="company-chart-legend">
        {series.map((item) => (
          <li key={item.key}>
            <span
              className="company-chart-swatch"
              style={{ background: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
