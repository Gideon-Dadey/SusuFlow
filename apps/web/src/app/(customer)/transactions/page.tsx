'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent } from '@/components/ui/card';
import { depositApi, withdrawalApi, Transaction, userApi } from '@/lib/api';
import { TransactionListSkeleton } from '@/components/ui/skeleton';
import { ReceiptModal } from '@/components/financial/receipt-modal';
import { useAuthStore } from '@/stores/auth.store';
import { useOfflineSync } from '@/components/offline-sync-provider';

export default function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { queuedDeposits } = useOfflineSync();

  // Query current user's profile to retrieve the associated customer account
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-me'],
    queryFn: () => userApi.getMe(),
  });

  const activeCustomer = userProfile?.customer;

  const { data: depositsData, isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits', activeCustomer?.id],
    queryFn: () => depositApi.list({ customer_id: activeCustomer?.id }),
    enabled: !!activeCustomer,
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawals', activeCustomer?.id],
    queryFn: () => withdrawalApi.list({ customer_id: activeCustomer?.id }),
    enabled: !!activeCustomer,
  });

  const isLoading = depositsLoading || withdrawalsLoading;

  const mappedQueued: Transaction[] = queuedDeposits.map(q => ({
    id: q.id,
    reference: q.reference,
    type: 'deposit',
    status: q.status,
    amount: q.amount,
    currency: 'GHS',
    createdAt: q.createdAt,
    description: `Deposit via ${q.paymentMethod} (Queued Offline)`,
    customer: {
      customerNumber: 'Offline',
      user: {
        firstName: q.customerName.split(' ')[0] || 'Customer',
        lastName: q.customerName.split(' ').slice(1).join(' ') || ''
      }
    },
    payment: {
      paymentMethod: q.paymentMethod,
      status: q.status === 'syncing' ? 'pending' : 'initiated'
    }
  }));

  const transactions = [
    ...mappedQueued,
    ...(depositsData?.items || []),
    ...(withdrawalsData?.items || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
