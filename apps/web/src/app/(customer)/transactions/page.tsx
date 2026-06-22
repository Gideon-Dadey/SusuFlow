'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { depositApi, Transaction } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';
import { ReceiptModal } from '@/components/financial/receipt-modal';

export default function TransactionsPage() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['deposits', 'all'],
    queryFn: () => depositApi.list(),
  });

  const transactions = data?.items || [];

  return (
    <div className="space-y-4">
      <h1 className="dashboard-title">Transaction History</h1>
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <TransactionListSkeleton count={4} />
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No transactions found</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTxn(t);
                    setReceiptOpen(true);
                  }}
                  className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg px-2"
                >
                  <TransactionRow transaction={t} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedTxn(null);
        }}
      />
    </div>
  );
}
