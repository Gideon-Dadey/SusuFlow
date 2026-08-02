"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ledgerApi } from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import { portalDashboardMetricsGridClass } from "@/lib/portal-dashboard-tokens";

export default function TrialBalancePage() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["staff-ledger-accounts"],
    queryFn: () => ledgerApi.listAccounts(),
  });

  const trialBalanceAccounts = accounts || [];

  // Compute trial balance totals
  let totalDebits = 0;
  let totalCredits = 0;

  for (const account of trialBalanceAccounts) {
    const isNormalCredit = ["liability", "revenue", "equity"].includes(
      account.accountType,
    );

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
        <h1 className="dashboard-title">General Ledger</h1>
      </div>

      {/* Trial balance summary metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Debits
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(totalDebits)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Normal Debit Accounts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Credits
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(totalCredits)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Normal Credit Accounts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ledger Status
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm sm:text-lg font-bold text-foreground">
              {isBalanced ? "In Balance" : "Unbalanced"}
            </span>
            <StatusBadge status={isBalanced ? "completed" : "failed"} />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Double-entry audit check
          </p>
        </Card>
      </div>

      {/* Trial Balance Sheet Table */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Trial Balance Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3.5 px-6">Account Code</th>
                  <th className="py-3.5 px-6">Account Name</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6 text-right">Debit (GHS)</th>
                  <th className="py-3.5 px-6 text-right">Credit (GHS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      Loading chart of accounts...
                    </td>
                  </tr>
                ) : trialBalanceAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No accounts registered
                    </td>
                  </tr>
                ) : (
                  trialBalanceAccounts.map((account) => {
                    const isNormalCredit = [
                      "liability",
                      "revenue",
                      "equity",
                    ].includes(account.accountType);
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
                      <tr
                        key={account.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3.5 px-6 text-xs font-mono text-muted-foreground">
                          {account.code}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-xs text-foreground">
                          {account.name}
                        </td>
                        <td className="py-3.5 px-6 text-xs">
                          <span className="inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                            {account.accountType}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-bold text-xs tabular-nums text-foreground">
                          {dr > 0 ? formatGhs(dr) : "-"}
                        </td>
                        <td className="py-3.5 px-6 text-right font-bold text-xs tabular-nums text-foreground">
                          {cr > 0 ? formatGhs(cr) : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Total Row */}
                {!isLoading && trialBalanceAccounts.length > 0 && (
                  <tr className="border-t-2 border-border/80 bg-muted/30 font-bold text-xs">
                    <td
                      className="py-3.5 px-6 uppercase tracking-wider text-muted-foreground"
                      colSpan={3}
                    >
                      Total Balance
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold tabular-nums text-foreground">
                      {formatGhs(totalDebits)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold tabular-nums text-foreground">
                      {formatGhs(totalCredits)}
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
