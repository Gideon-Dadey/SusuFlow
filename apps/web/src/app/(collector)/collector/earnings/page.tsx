"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { operationsApi, depositApi } from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faWallet,
  faChartLine,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function CollectorEarningsPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["collector-summary"],
    queryFn: () => operationsApi.getMySummary(),
  });

  const { data: deposits } = useQuery({
    queryKey: ["collector-deposits-completed"],
    queryFn: () => depositApi.list({ status: "completed" }),
  });

  const completed = deposits?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">Earnings</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
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
            <p className="text-2xl font-bold">
              {formatGhs(summary?.depositsVolume ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.depositsCount ?? 0} completed
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-4 w-4 text-sky-500"
            />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">
              {formatGhs(summary?.weekDepositsVolume ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.weekDepositsCount ?? 0} deposits
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon
              icon={faCoins}
              className="h-4 w-4 text-amber-500"
            />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">
              {formatGhs(summary?.commissionEarned ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From verified deposits
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="h-4 w-4 text-emerald-600"
            />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Balance Payable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatGhs(summary?.commissionBalance ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Paid out: {formatGhs(summary?.commissionPaid ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How commission works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Commission is calculated automatically when a customer&apos;s MoMo
            deposit is confirmed by the payment gateway. You cannot manually
            adjust amounts — this prevents fraud and disputes.
          </p>
          <p>
            Your company admin processes payouts from the Commissions page.
            Contact them for payment schedules.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent completed collections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-32 animate-pulse bg-muted/50 m-4 rounded-lg" />
          ) : completed.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No completed collections yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {completed.slice(0, 15).map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">
                        {tx.reference}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {tx.customer?.user
                          ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatGhs(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
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
