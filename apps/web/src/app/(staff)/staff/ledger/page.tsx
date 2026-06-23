'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ledgerApi } from '@/lib/api';

export default function TrialBalancePage() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['staff-ledger-accounts'],
    queryFn: () => ledgerApi.listAccounts(),
  });

  const trialBalanceAccounts = accounts || [];

  // Compute trial balance totals
  // In double entry, we check the sum of debits vs credits for all accounts
  let totalDebits = 0;
  let totalCredits = 0;

  for (const account of trialBalanceAccounts) {
    const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);
    
    // Normal debit accounts: positive balance goes to Debit column, negative to Credit column
    // Normal credit accounts: positive balance goes to Credit column, negative to Debit column
    if (isNormalCredit) {
      if (account.balance >= 0) {
        totalCredits += account.balance;
      } else {
        totalDebits += Math.abs(account.balance);
      }
    } else {
      if (account.balance >= 0) {
        totalDebits += account.balance;
      } else {
        totalCredits += Math.abs(account.balance);
      }
    }
  }

  // Round values
  totalDebits = Math.round(totalDebits * 100) / 100;
  totalCredits = Math.round(totalCredits * 100) / 100;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">General Ledger & Trial Balance</h1>
      </div>

      {/* Trial balance health alert */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Debits
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              GHS {totalDebits.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Credits
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              GHS {totalCredits.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card
          className={`backdrop-blur-md border shadow-sm ${
            isBalanced
              ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30'
              : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30'
          }`}
        >
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Ledger Status
            </span>
            <span
              className={`text-lg font-bold mt-1 block ${
                isBalanced
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isBalanced ? '✓ Balanced' : '⚠️ Out of Balance'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Sheet Table */}
      <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground">Trial Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Account Code</th>
                  <th className="p-4">Account Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Debit (GHS)</th>
                  <th className="p-4 text-right">Credit (GHS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading chart of accounts...
                    </td>
                  </tr>
                ) : trialBalanceAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No accounts registered
                    </td>
                  </tr>
                ) : (
                  trialBalanceAccounts.map((account) => {
                    const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);
                    let dr = 0;
                    let cr = 0;

                    if (isNormalCredit) {
                      if (account.balance >= 0) {
                        cr = account.balance;
                      } else {
                        dr = Math.abs(account.balance);
                      }
                    } else {
                      if (account.balance >= 0) {
                        dr = account.balance;
                      } else {
                        cr = Math.abs(account.balance);
                      }
                    }

                    return (
                      <tr key={account.id} className="hover:bg-muted/10">
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {account.code}
                        </td>
                        <td className="p-4 font-semibold text-foreground">{account.name}</td>
                        <td className="p-4 text-xs text-muted-foreground capitalize">
                          {account.accountType}
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-foreground">
                          {dr > 0 ? dr.toFixed(2) : '-'}
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-foreground">
                          {cr > 0 ? cr.toFixed(2) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Total Row */}
                {!isLoading && trialBalanceAccounts.length > 0 && (
                  <tr className="border-t-2 border-border bg-muted/20 font-bold">
                    <td className="p-4" colSpan={3}>
                      Total
                    </td>
                    <td className="p-4 text-right font-mono text-foreground">
                      GHS {totalDebits.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-mono text-foreground">
                      GHS {totalCredits.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
