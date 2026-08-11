"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { ledgerApi } from "@/lib/api";
import { formatGhs, formatDate } from "@/lib/utils";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import {
  CompanyPanel,
  CompanyPanelHeader,
} from "@/components/company-admin/company-panel";

export default function CommissionsLedgerPage() {
  const queryClient = useQueryClient();
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");
  const [payoutAmount, setPayoutAmount] = useState<string>("");
  const [payoutDescription, setPayoutDescription] = useState<string>("");
  const [isPayingOut, setIsPayingOut] = useState<boolean>(false);

  const { data: commissions, isLoading } = useQuery({
    queryKey: ["staff-commissions"],
    queryFn: () => ledgerApi.listCommissions(),
  });

  const payoutMutation = useMutation({
    mutationFn: (data: {
      collectorId: string;
      amount: number;
      description?: string;
    }) => ledgerApi.payoutCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-commissions"] });
      setPayoutAmount("");
      setPayoutDescription("");
      setSelectedCollectorId("");
      setIsPayingOut(false);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Payout failed");
    },
  });

  // Calculate collector summaries from transactions list
  const collectorMap: Record<
    string,
    {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      earned: number;
      paid: number;
      balance: number;
    }
  > = {};

  const transactions = commissions || [];

  for (const tx of transactions) {
    if (!tx.collector) continue;
    const col = tx.collector;
    if (!collectorMap[col.id]) {
      collectorMap[col.id] = {
        id: col.id,
        firstName: col.firstName,
        lastName: col.lastName,
        email: col.email,
        earned: 0,
        paid: 0,
        balance: 0,
      };
    }

    const summary = collectorMap[col.id];
    if (tx.type === "deposit") {
      const entry1200 = tx.ledgerEntries?.find(
        (e: any) => e.account?.code === "1200",
      );
      const commissionAmt = entry1200 ? Number(entry1200.amount) : 0;
      summary.earned += commissionAmt;
      summary.balance += commissionAmt;
    } else if (tx.type === "commission") {
      const payoutAmt = Number(tx.amount);
      summary.paid += payoutAmt;
      summary.balance -= payoutAmt;
    }
  }

  const collectors = Object.values(collectorMap);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectorId) {
      alert("Please select a collector");
      return;
    }
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid payout amount");
      return;
    }

    const collector = collectorMap[selectedCollectorId];
    if (collector && amt > collector.balance) {
      alert(
        `Cannot payout more than available balance of GHS ${collector.balance.toFixed(2)}`,
      );
      return;
    }

    await payoutMutation.mutateAsync({
      collectorId: selectedCollectorId,
      amount: amt,
      description: payoutDescription || undefined,
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Type",
      "Collector Name",
      "Collector Email",
      "Ref/Desc",
      "Amount (GHS)",
    ];
    const rows = transactions.map((t: any) => {
      const entry1200 = t.ledgerEntries?.find(
        (e: any) => e.account?.code === "1200",
      );
      const commissionAmt = entry1200 ? Number(entry1200.amount) : 0;
      return [
        new Date(t.createdAt).toLocaleDateString(),
        t.type === "deposit" ? "Earned" : "Paid Out",
        t.collector
          ? `"${t.collector.firstName} ${t.collector.lastName}"`
          : "N/A",
        t.collector?.email || "N/A",
        t.type === "deposit" ? t.reference : t.description || "Payout",
        t.type === "deposit" ? commissionAmt : t.amount,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commissions_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        title="Commissions"
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!transactions.length}
              className="company-cta-secondary disabled:opacity-50"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={() => setIsPayingOut(!isPayingOut)}
              className="company-cta-primary"
            >
              {isPayingOut ? "Close panel" : "Record payout"}
            </button>
          </>
        }
      />

      {isPayingOut && (
        <CompanyPanel className="max-w-xl" padded>
          <h2 className="company-panel-title mb-4">Record commission payout</h2>
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Select Collector
              </label>
              <select
                value={selectedCollectorId}
                onChange={(e) => setSelectedCollectorId(e.target.value)}
                className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary min-h-[40px]"
                required
              >
                <option value="">-- Choose Collector --</option>
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} (Bal: {formatGhs(c.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Payout Amount (GHS)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="min-h-[40px] rounded-none border border-border/60 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Notes / Reference
              </label>
              <Input
                type="text"
                placeholder="e.g. Paid via Mobile Money"
                value={payoutDescription}
                onChange={(e) => setPayoutDescription(e.target.value)}
                className="min-h-[40px] rounded-none border border-border/60 text-xs"
              />
            </div>

            <Button
              type="submit"
              loading={payoutMutation.isPending}
              className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white min-h-[40px] border-none"
            >
              Confirm Payout
            </Button>
          </form>
        </CompanyPanel>
      )}

      <CompanyPanel>
        <CompanyPanelHeader title="Agent balances" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                <th className="py-3.5 px-6">Collector</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Total Earned</th>
                <th className="py-3.5 px-6">Total Paid</th>
                <th className="py-3.5 px-6 text-right">Available Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Loading collector summaries...
                  </td>
                </tr>
              ) : collectors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    No collector commission data found
                  </td>
                </tr>
              ) : (
                collectors.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-xs text-foreground">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="py-3.5 px-6 text-muted-foreground text-xs font-mono">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-6 text-foreground text-xs font-semibold tabular-nums">
                      {formatGhs(c.earned)}
                    </td>
                    <td className="py-3.5 px-6 text-muted-foreground text-xs font-semibold tabular-nums">
                      {formatGhs(c.paid)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-xs tabular-nums text-foreground">
                      {formatGhs(c.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CompanyPanel>

      <CompanyPanel>
        <CompanyPanelHeader title="Commissions log" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Collector</th>
                <th className="py-3.5 px-6">Reference / Notes</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Loading activity logs...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    No recent activities recorded
                  </td>
                </tr>
              ) : (
                transactions.map((t: any) => {
                  const isEarned = t.type === "deposit";
                  const entry1200 = t.ledgerEntries?.find(
                    (e: any) => e.account?.code === "1200",
                  );
                  const displayAmt = isEarned
                    ? Number(entry1200?.amount || 0)
                    : Number(t.amount);

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-6 text-xs text-muted-foreground font-mono">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-xs">
                        <StatusBadge
                          status={isEarned ? "completed" : "pending"}
                        />
                      </td>
                      <td className="py-3.5 px-6 text-foreground font-semibold text-xs">
                        {t.collector
                          ? `${t.collector.firstName} ${t.collector.lastName}`
                          : "System"}
                      </td>
                      <td className="py-3.5 px-6 text-muted-foreground text-xs">
                        {isEarned ? `Deposit: ${t.reference}` : t.description}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-xs tabular-nums text-foreground">
                        {isEarned ? "+" : "-"}
                        {formatGhs(displayAmt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CompanyPanel>
    </div>
  );
}
