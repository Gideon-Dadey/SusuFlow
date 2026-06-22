'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { withdrawalApi, Transaction } from '@/lib/api';
import { formatGhs, formatDate } from '@/lib/utils';
import { TransactionListSkeleton } from '@/components/ui/skeleton';
import { ReceiptModal } from '@/components/financial/receipt-modal';
import { ArrowUpRight } from 'lucide-react';

export default function StaffWithdrawalsPage() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['staff-withdrawals'],
    queryFn: () => withdrawalApi.list(),
  });

  const withdrawals = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Withdrawals</h1>
        <p className="text-xs text-muted-foreground">History of payouts and client withdrawals</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No withdrawals recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {withdrawals.map((t) => {
                const amt = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTxn(t);
                      setReceiptOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {t.customer?.user ? `${t.customer.user.firstName} ${t.customer.user.lastName}` : 'Customer'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-red-600">-{formatGhs(amt)}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">{t.reference}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal transaction={selectedTxn} open={receiptOpen} onClose={() => setSelectedTxn(null)} />
    </div>
  );
}
