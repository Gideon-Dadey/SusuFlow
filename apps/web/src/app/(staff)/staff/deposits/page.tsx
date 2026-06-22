'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { depositApi } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';

export default function StaffDepositsPage() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['staff-deposits'],
    queryFn: () => depositApi.list(),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => depositApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-deposits'] });
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : 'Verification failed');
    },
  });

  const handleVerify = async (id: string) => {
    setConfirmingId(id);
    try {
      await confirmMutation.mutateAsync(id);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">All Deposits</h1>
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : (
            (data?.items || []).map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                action={
                  t.status === 'pending' ? (
                    <Button
                      size="sm"
                      className="font-semibold text-xs py-1 px-3 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      loading={confirmingId === t.id}
                      onClick={() => handleVerify(t.id)}
                    >
                      Verify
                    </Button>
                  ) : undefined
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
