'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ledgerApi } from '@/lib/api';

export default function CommissionsLedgerPage() {
  const queryClient = useQueryClient();
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutDescription, setPayoutDescription] = useState<string>('');
  const [isPayingOut, setIsPayingOut] = useState<boolean>(false);

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['staff-commissions'],
    queryFn: () => ledgerApi.listCommissions(),
  });

  const payoutMutation = useMutation({
    mutationFn: (data: { collectorId: string; amount: number; description?: string }) =>
      ledgerApi.payoutCommission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-commissions'] });
      setPayoutAmount('');
      setPayoutDescription('');
      setSelectedCollectorId('');
      setIsPayingOut(false);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : 'Payout failed');
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
    if (tx.type === 'deposit') {
      const entry1200 = tx.ledgerEntries?.find(
        (e: any) => e.account?.code === '1200',
      );
      const commissionAmt = entry1200 ? Number(entry1200.amount) : 0;
      summary.earned += commissionAmt;
      summary.balance += commissionAmt;
    } else if (tx.type === 'commission') {
      const payoutAmt = Number(tx.amount);
      summary.paid += payoutAmt;
      summary.balance -= payoutAmt;
    }
  }

  const collectors = Object.values(collectorMap);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectorId) {
      alert('Please select a collector');
      return;
    }
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payout amount');
      return;
    }

    const collector = collectorMap[selectedCollectorId];
    if (collector && amt > collector.balance) {
      alert(`Cannot payout more than available balance of GHS ${collector.balance.toFixed(2)}`);
      return;
    }

    await payoutMutation.mutateAsync({
      collectorId: selectedCollectorId,
      amount: amt,
      description: payoutDescription || undefined,
    });
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Type', 'Collector Name', 'Collector Email', 'Ref/Desc', 'Amount (GHS)'];
    const rows = transactions.map((t: any) => {
      const entry1200 = t.ledgerEntries?.find((e: any) => e.account?.code === '1200');
      const commissionAmt = entry1200 ? Number(entry1200.amount) : 0;
      return [
        new Date(t.createdAt).toLocaleDateString(),
        t.type === 'deposit' ? 'Earned' : 'Paid Out',
        t.collector ? `"${t.collector.firstName} ${t.collector.lastName}"` : 'N/A',
        t.collector?.email || 'N/A',
        t.type === 'deposit' ? t.reference : t.description || 'Payout',
        t.type === 'deposit' ? commissionAmt : t.amount,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commissions_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Collector Commissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and disburse commissions accrued by cashless field agents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs font-semibold px-4 min-h-[36px]"
            disabled={!transactions.length}
          >
            Download CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPayingOut(!isPayingOut)}
            className="text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95"
          >
            {isPayingOut ? 'Close Payout Panel' : 'Record Payout'}
          </Button>
        </div>
      </div>

      {isPayingOut && (
        <Card className="bg-card/70 backdrop-blur-md border border-border shadow-md max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Record Commission Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select Collector</label>
                <select
                  value={selectedCollectorId}
                  onChange={(e) => setSelectedCollectorId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                  required
                >
                  <option value="">-- Choose Collector --</option>
                  {collectors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} (Bal: GHS {c.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Payout Amount (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notes / Reference</label>
                <Input
                  type="text"
                  placeholder="e.g. Paid via Mobile Money"
                  value={payoutDescription}
                  onChange={(e) => setPayoutDescription(e.target.value)}
                  className="min-h-[44px]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={payoutMutation.isPending}
                className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-none min-h-[44px]"
              >
                Confirm Payout
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Collector balances summary card */}
      <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground">Agent Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Collector</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Total Earned</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4 text-right">Available Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading collector summaries...
                    </td>
                  </tr>
                ) : collectors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No collector commission data found
                    </td>
                  </tr>
                ) : (
                  collectors.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/10">
                      <td className="p-4 font-semibold text-foreground">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{c.email}</td>
                      <td className="p-4 text-foreground text-xs">GHS {c.earned.toFixed(2)}</td>
                      <td className="p-4 text-muted-foreground text-xs">GHS {c.paid.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        GHS {c.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit ledger transaction list */}
      <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground">Commissions Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Collector</th>
                  <th className="p-4">Reference/Description</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No recent activities recorded
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => {
                    const isEarned = t.type === 'deposit';
                    const entry1200 = t.ledgerEntries?.find((e: any) => e.account?.code === '1200');
                    const displayAmt = isEarned ? Number(entry1200?.amount || 0) : Number(t.amount);

                    return (
                      <tr key={t.id} className="hover:bg-muted/10">
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-xs font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              isEarned
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {isEarned ? 'Earning' : 'Payout'}
                          </span>
                        </td>
                        <td className="p-4 text-foreground font-medium text-xs">
                          {t.collector
                            ? `${t.collector.firstName} ${t.collector.lastName}`
                            : 'System'}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {isEarned ? `Deposit: ${t.reference}` : t.description}
                        </td>
                        <td
                          className={`p-4 text-right font-bold text-xs ${
                            isEarned
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {isEarned ? '+' : '-'} GHS {displayAmt.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
