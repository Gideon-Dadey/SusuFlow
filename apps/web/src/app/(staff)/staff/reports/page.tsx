"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportApi, tenantApi } from "@/lib/api";
import { formatGhs, getTenantSlug } from "@/lib/utils";
import { useState } from "react";

export default function ReportsHubPage() {
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["staff-reports-summary"],
    queryFn: () => reportApi.getSummary(),
  });

  const seedMutation = useMutation({
    mutationFn: () => tenantApi.seedDemo(getTenantSlug() || "adipa"),
    onSuccess: (res) => {
      alert(res.message || "Demo data successfully seeded!");
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Seeding failed");
    },
  });

  const handleSeedDemo = async () => {
    if (
      confirm(
        "Are you sure you want to seed demo data? This will reset/re-initialize transaction histories, KYC documents, fraud flags, and ledger accounts for this organization.",
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
    const headers = ["Metric", "Value (GHS)"];
    const rows = [
      ["Total Deposits", summary.totalDeposits],
      ["Total Withdrawals", summary.totalWithdrawals],
      ["Outstanding Customer Liability", summary.outstandingLiability],
      ["Collector Commissions Payable", summary.collectorCommissionsPayable],
      ["Total Commission Expense", summary.totalCommissionExpense],
      ["Platform Cash Reserve", summary.platformCash],
      [
        "Net Operations Balance (Deposits - Withdrawals)",
        summary.netOperationsBalance,
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operations_summary_${Date.now()}.csv`);
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Deposits
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(summary.totalDeposits)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Inbound payments
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Withdrawals
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(summary.totalWithdrawals)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Processed payouts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform Cash Reserve
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(summary.platformCash)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">Liquid funds</p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Customer Liability
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(summary.outstandingLiability)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Saver balances
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional liability and expense card */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden flex flex-col justify-between">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
              Accruals & Overhead
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-border/60 pb-3">
              <span className="text-muted-foreground font-semibold">
                Collector Commissions Payable
              </span>
              <span className="font-bold tabular-nums text-foreground">
                {formatGhs(summary.collectorCommissionsPayable)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-border/60 pb-3">
              <span className="text-muted-foreground font-semibold">
                Total Commission Expense
              </span>
              <span className="font-bold tabular-nums text-foreground">
                {formatGhs(summary.totalCommissionExpense)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pb-1">
              <span className="text-muted-foreground font-semibold">
                Net Operations Balance
              </span>
              <span className="font-bold tabular-nums text-foreground">
                {formatGhs(summary.netOperationsBalance)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Daily operations activity trends */}
        <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border/60">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
              Daily Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/20 border-b border-border/60 font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Deposits</th>
                    <th className="py-3 px-4 text-right">Withdrawals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        Loading trends...
                      </td>
                    </tr>
                  ) : trends.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        No transactions trend available
                      </td>
                    </tr>
                  ) : (
                    trends.map((t) => (
                      <tr
                        key={t.date}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-semibold text-foreground">
                          {t.date}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-foreground">
                          {formatGhs(t.deposits)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums text-foreground">
                          {formatGhs(t.withdrawals)}
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
