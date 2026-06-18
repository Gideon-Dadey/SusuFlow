'use client';

import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { depositApi } from '@/lib/api';

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
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            (data?.items || []).map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
