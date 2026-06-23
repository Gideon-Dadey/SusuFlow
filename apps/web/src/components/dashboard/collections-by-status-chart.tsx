'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatGhs } from '@/lib/utils';

interface CollectionsByStatusChartProps {
  transactions: Array<{
    id: string;
    amount: string | number;
    status: string;
    createdAt: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'hsl(160, 84%, 50%)' },
  pending: { label: 'Pending', color: 'hsl(40, 96%, 56%)' },
  failed: { label: 'Failed', color: 'hsl(0, 72%, 56%)' },
  cancelled: { label: 'Cancelled', color: 'hsl(220, 14%, 46%)' },
};

export function CollectionsByStatusChart({ transactions }: CollectionsByStatusChartProps) {
  const { data, total } = useMemo(() => {
    const buckets: Record<string, number> = {};
    let runningTotal = 0;

    for (const t of transactions) {
      const key = t.status || 'completed';
      const amount = Number(t.amount);
      buckets[key] = (buckets[key] || 0) + amount;
      runningTotal += amount;
    }

    const chartData = Object.entries(buckets)
      .map(([status, value]) => ({
        name: STATUS_CONFIG[status]?.label || status,
        value,
        color: STATUS_CONFIG[status]?.color || 'hsl(220, 14%, 46%)',
        percentage: runningTotal > 0 ? ((value / runningTotal) * 100).toFixed(0) : '0',
      }))
      .sort((a, b) => b.value - a.value);

    return { data: chartData, total: runningTotal };
  }, [transactions]);

  return (
    <Card className="col-span-1 lg:col-span-5">
      <CardHeader className="pb-2">
        <p className="text-sm font-medium text-muted-foreground">Collections by Status</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          {/* Donut chart */}
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.length > 0 ? data : [{ name: 'No data', value: 1, color: 'hsl(220, 14%, 26%)' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={data.length > 1 ? 3 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {(data.length > 0
                    ? data
                    : [{ name: 'No data', value: 1, color: 'hsl(220, 14%, 26%)' }]
                  ).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="text-base font-bold text-foreground">{formatGhs(total)}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatGhs(item.value)}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-xs text-muted-foreground">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center border-t border-border pt-3">
          <a
            href="/staff/deposits"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View details →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
