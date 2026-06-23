"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { operationsApi } from "@/lib/api";
import { formatGhs, getInitials } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faUsers,
  faWallet,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

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
        <p className="text-sm text-muted-foreground mt-1">
          Field agent metrics — collections, customers, and commissions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon icon={faRoute} className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collectors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{collectors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-sky-500" />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold">{totalCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon
              icon={faWallet}
              className="h-4 w-4 text-emerald-500"
            />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">{formatGhs(totalVolume)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon
              icon={faCoins}
              className="h-4 w-4 text-amber-500"
            />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commission Payable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">{formatGhs(totalCommission)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Collector Leaderboard</CardTitle>
          <Link
            href="/staff/commissions"
            className="text-xs font-medium text-primary hover:underline"
          >
            Manage payouts →
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 animate-pulse rounded-lg bg-muted/60" />
          ) : collectors.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No collectors on your team yet
              </p>
              <Link
                href="/staff/team"
                className="text-xs text-primary font-medium mt-2 inline-block hover:underline"
              >
                Add a collector from Team management →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Collector</th>
                    <th className="py-3 px-4 text-right">Customers</th>
                    <th className="py-3 px-4 text-right">Deposits</th>
                    <th className="py-3 px-4 text-right">Volume</th>
                    <th className="py-3 px-4 text-right">Commission</th>
                    <th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-right">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {collectors.map((collector, index) => (
                    <tr key={collector.id} className="hover:bg-muted/30">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index < 3
                              ? `#${index + 1}`
                              : getInitials(
                                  collector.firstName,
                                  collector.lastName,
                                )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {collector.firstName} {collector.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {collector.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        {collector.customerCount}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground">
                        {collector.depositsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold">
                        {formatGhs(collector.depositsVolume)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                        {formatGhs(collector.commissionEarned)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatGhs(collector.commissionBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <StatusBadge status={collector.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/staff/audit?userId=${collector.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View activity
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
