'use client';

import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';

export default function CollectorDepositsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collector-deposits-all'],
    queryFn: () => depositApi.list(),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title hidden lg:block">Deposit history</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All assisted deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No deposits yet.</p>
          ) : (
            items.map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
