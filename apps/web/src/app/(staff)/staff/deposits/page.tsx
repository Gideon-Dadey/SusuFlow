'use client';

import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { depositApi } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';

export default function StaffDepositsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff-deposits'],
    queryFn: () => depositApi.list(),
  });

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">All Deposits</h1>
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : (
            (data?.items || []).map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
