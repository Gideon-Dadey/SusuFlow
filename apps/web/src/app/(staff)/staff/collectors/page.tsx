"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { operationsApi } from "@/lib/api";
import { formatGhs, getInitials } from "@/lib/utils";

export default function CollectorsPerformancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-collectors"],
    queryFn: () => operationsApi.getCollectors(),
  });

  const collectors = data?.items ?? [];
  const totalVolume = collectors.reduce((s, c) => s + c.depositsVolume, 0);
  const totalCustomers = collectors.reduce((s, c) => s + c.customerCount, 0);
  const totalCommission = collectors.reduce(
    (s, c) => s + c.commissionBalance,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Collector Performance</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Collectors
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {collectors.length}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Active field agents
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Assigned Customers
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {totalCustomers}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Managed saver accounts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Collected
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {formatGhs(totalVolume)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Field deposit volume
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Commission Payable
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {formatGhs(totalCommission)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Available balance
          </p>
        </Card>
      </div>

      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Collector Leaderboard
          </CardTitle>
          <Link
            href="/staff/commissions"
            className="text-xs font-semibold text-secondary hover:underline transition-colors"
          >
            Manage payouts →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 animate-pulse rounded-none bg-muted/60" />
          ) : collectors.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">
                No collectors on your team yet
              </p>
              <Link
                href="/staff/team"
                className="text-xs text-secondary font-semibold hover:underline block"
              >
                Add a collector from Team management →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3.5 px-4">Collector</th>
                    <th className="py-3.5 px-4 text-right">Savers</th>
                    <th className="py-3.5 px-4 text-right">Deposits</th>
                    <th className="py-3.5 px-4 text-right">Volume</th>
                    <th className="py-3.5 px-4 text-right">Commission</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {collectors.map((collector, index) => (
                    <tr
                      key={collector.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {index < 3
                              ? `#${index + 1}`
                              : getInitials(
                                  collector.firstName,
                                  collector.lastName,
                                )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">
                              {collector.firstName} {collector.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {collector.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                        {collector.customerCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-muted-foreground">
                        {collector.depositsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                        {formatGhs(collector.depositsVolume)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-muted-foreground">
                        {formatGhs(collector.commissionEarned)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                        {formatGhs(collector.commissionBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status={collector.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/staff/audit?userId=${collector.id}`}
                          className="text-xs font-semibold text-secondary hover:underline"
                        >
                          Activity Log
                        </Link>
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
