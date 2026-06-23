'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatGhs } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faWallet, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default function AdminCommissionsPage() {
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['admin-global-commissions'],
    queryFn: () => adminApi.getCommissions(),
  });

  const items = commissions?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Collector Commissions</h1>
        <p className="text-sm text-muted-foreground">Consolidated earnings, historical disbursements, and payable balances for collectors system-wide</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 w-full animate-pulse rounded-lg bg-muted/65" />
          <div className="h-64 w-full animate-pulse rounded-lg bg-muted/65" />
        </div>
      ) : (
        <>
          {/* Commission KPI Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faCoins} className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Earned</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{formatGhs(commissions?.totalEarned ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">1% of system-wide completed deposits</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faWallet} className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total Disbursed</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{formatGhs(commissions?.totalPaid ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">Paid out via cash or momo channels</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5 text-sky-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Net Outstanding</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">
                  {formatGhs((commissions?.totalEarned ?? 0) - (commissions?.totalPaid ?? 0))}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Unpaid collector balances</p>
              </CardContent>
            </Card>
          </div>

          {/* Collectors Table */}
          <Card className="portal-card border-border/60">
            <CardHeader>
              <CardTitle>Collector Ledger Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No active collectors registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                        <th className="py-3 px-4">Collector Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4 text-right">Total Earned</th>
                        <th className="py-3 px-4 text-right">Total Paid</th>
                        <th className="py-3 px-4 text-right">Unpaid Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {item.firstName} {item.lastName}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                            {item.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                              {item.tenantName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs font-mono text-muted-foreground">
                            {formatGhs(item.earned)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs font-mono text-muted-foreground">
                            {formatGhs(item.paid)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-foreground font-mono">
                            {formatGhs(item.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
