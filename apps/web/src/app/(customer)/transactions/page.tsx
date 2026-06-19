'use client';

import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { depositApi } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
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
            transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
