'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatGhs } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faTriangleExclamation, faBalanceScale } from '@fortawesome/free-solid-svg-icons';

export default function AdminLedgerPage() {
  const { data: ledger, isLoading } = useQuery({
    queryKey: ['admin-global-ledger'],
    queryFn: () => adminApi.getLedger(),
  });

  const accounts = ledger?.accounts ?? [];

  // Calculate totals
  const totalDebits = accounts.reduce((sum: number, acc: any) => sum + (acc.debitSum || 0), 0);
  const totalCredits = accounts.reduce((sum: number, acc: any) => sum + (acc.creditSum || 0), 0);
  const diff = Math.abs(totalDebits - totalCredits);
  const isBalanced = diff < 0.1;

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Consolidated Ledger</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 w-full animate-pulse rounded-lg bg-muted/65" />
          <div className="h-64 w-full animate-pulse rounded-lg bg-muted/65" />
        </div>
      ) : (
        <>
          {/* Balancing Alerts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faBalanceScale} className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Debits vs Credits</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Ledger Balanced</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">Imbalance Detected</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Difference: {formatGhs(diff)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sum of Assets</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-2xl font-extrabold text-foreground">{formatGhs(ledger?.totalAssetBalance ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">Cash assets in float</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Saver Liabilities</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-2xl font-extrabold text-foreground">{formatGhs(ledger?.totalLiabilityBalance ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">Customer cash balances</p>
              </CardContent>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card className="portal-card border-border/60">
            <CardHeader>
              <CardTitle>Consolidated Trial Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No accounts configured.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Account Name</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4 text-right">Debit Sum</th>
                        <th className="py-3 px-4 text-right">Credit Sum</th>
                        <th className="py-3 px-4 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {accounts.map((acc: any) => (
                        <tr key={acc.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-foreground">
                            {acc.code}
                          </td>
                          <td className="py-3 px-4 font-medium text-foreground">{acc.name}</td>
                          <td className="py-3 px-4 text-xs capitalize text-muted-foreground">
                            {acc.accountType}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {acc.tenant?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-muted-foreground">
                            {formatGhs(acc.debitSum)}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-mono text-muted-foreground">
                            {formatGhs(acc.creditSum)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-foreground font-mono">
                            {formatGhs(acc.balance)}
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
