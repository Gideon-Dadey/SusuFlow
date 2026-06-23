'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { reportApi, tenantApi } from '@/lib/api';
import { getTenantSlug } from '@/lib/utils';
import { useState } from 'react';

export default function ReportsHubPage() {
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['staff-reports-summary'],
    queryFn: () => reportApi.getSummary(),
  });

  const seedMutation = useMutation({
    mutationFn: () => tenantApi.seedDemo(getTenantSlug() || 'abc-susu'),
    onSuccess: (res) => {
      alert(res.message || 'Demo data successfully seeded!');
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : 'Seeding failed');
    },
  });

  const handleSeedDemo = async () => {
    if (
      confirm(
        'Are you sure you want to seed demo data? This will reset/re-initialize transaction histories, KYC documents, fraud flags, and ledger accounts for this organization.',
      )
    ) {
      setSeeding(true);
      try {
        await seedMutation.mutateAsync();
      } finally {
        setSeeding(false);
      }
    }
  };

  const summary = reportData?.summary || {
    totalDeposits: 0,
    totalWithdrawals: 0,
    outstandingLiability: 0,
    collectorCommissionsPayable: 0,
    totalCommissionExpense: 0,
    platformCash: 0,
    netOperationsBalance: 0,
  };

  const trends = reportData?.dailyTrends || [];

  const handleExportCsv = () => {
    const headers = ['Metric', 'Value (GHS)'];
    const rows = [
      ['Total Deposits', summary.totalDeposits],
      ['Total Withdrawals', summary.totalWithdrawals],
      ['Outstanding Customer Liability', summary.outstandingLiability],
      ['Collector Commissions Payable', summary.collectorCommissionsPayable],
      ['Total Commission Expense', summary.totalCommissionExpense],
      ['Platform Cash Reserve', summary.platformCash],
      ['Net Operations Balance (Deposits - Withdrawals)', summary.netOperationsBalance],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `operations_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Reports & Analytics Hub</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSeedDemo}
            className="text-xs font-semibold px-4 min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            loading={seeding}
          >
            Initialize Demo Data
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs font-semibold px-4 min-h-[36px]"
            disabled={isLoading}
          >
            Export Summary CSV
          </Button>
        </div>
      </div>


      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Deposits
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              GHS {summary.totalDeposits.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Withdrawals
            </span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1 block">
              GHS {summary.totalWithdrawals.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Platform Cash Reserve
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
              GHS {summary.platformCash.toFixed(2)}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Customer Liability
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              GHS {summary.outstandingLiability.toFixed(2)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional liability and expense card */}
        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Accruals & Overhead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-border pb-3">
              <span className="text-muted-foreground">Collector Commissions Payable</span>
              <span className="font-bold text-foreground">
                GHS {summary.collectorCommissionsPayable.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-border pb-3">
              <span className="text-muted-foreground">Total Commission Expense</span>
              <span className="font-bold text-foreground">
                GHS {summary.totalCommissionExpense.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pb-1">
              <span className="text-muted-foreground">Net Operations Balance</span>
              <span
                className={`font-bold ${
                  summary.netOperationsBalance >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                GHS {summary.netOperationsBalance.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Daily operations activity trends */}
        <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Daily Activity Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border font-semibold text-muted-foreground">
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Deposits</th>
                    <th className="p-3 text-right">Withdrawals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        Loading trends...
                      </td>
                    </tr>
                  ) : trends.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No transactions trend available
                      </td>
                    </tr>
                  ) : (
                    trends.map((t) => (
                      <tr key={t.date} className="hover:bg-muted/10">
                        <td className="p-3 font-medium text-foreground">{t.date}</td>
                        <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                          GHS {t.deposits.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-red-600 dark:text-red-400 font-semibold">
                          GHS {t.withdrawals.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
