'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BalanceCard } from '@/components/financial/balance-card';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi, Transaction, userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { TransactionListSkeleton } from '@/components/ui/skeleton';
import { ReceiptModal } from '@/components/financial/receipt-modal';
import Link from 'next/link';
import { Wallet, FileText, ArrowRight, ArrowUpRight, Target } from 'lucide-react';

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Query current user's profile to retrieve the associated customer account
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-me'],
    queryFn: () => userApi.getMe(),
  });

  const activeCustomer = userProfile?.customer;

  // Query actual wallet balance from ledger
  const { data: walletData } = useQuery({
    queryKey: ['customer-wallet', activeCustomer?.id],
    queryFn: () =>
      activeCustomer
        ? import('@/lib/api').then((m) => m.customerApi.getWallet(activeCustomer.id))
        : Promise.resolve(null),
    enabled: !!activeCustomer,
  });

  // Query customer transactions (both deposits and withdrawals)
  const { data: depositsData, isLoading: depositsLoading } = useQuery({
    queryKey: ['deposits', activeCustomer?.id],
    queryFn: () => depositApi.list({ customer_id: activeCustomer?.id }),
    enabled: !!activeCustomer,
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawals', activeCustomer?.id],
    queryFn: () => import('@/lib/api').then((m) => m.withdrawalApi.list({ customer_id: activeCustomer?.id })),
    enabled: !!activeCustomer,
  });

  const isLoading = depositsLoading || withdrawalsLoading;

  const balance = walletData?.balance || 0;

  const transactions = [
    ...(depositsData?.items || []),
    ...(withdrawalsData?.items || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const todayTotal = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed' && new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="dashboard-title text-foreground">{user?.firstName}</h2>
      </div>

      <BalanceCard balance={balance} todayChange={todayTotal} />

      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/deposit', label: 'Deposit', icon: Wallet, color: 'bg-primary-100 text-primary' },
          { href: '/withdraw', label: 'Withdraw', icon: ArrowUpRight, color: 'bg-red-50 text-red-600 dark:bg-red-950/20' },
          { href: '/plans', label: 'Goals', icon: Target, color: 'bg-green-50 text-green-600 dark:bg-green-950/20' },
          { href: '/transactions', label: 'History', icon: FileText, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-secondary/40 hover:shadow-card"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link href="/transactions" className="text-sm text-primary flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TransactionListSkeleton count={3} />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No transactions yet</p>
              <Link href="/deposit" className="text-primary text-sm font-medium mt-2 inline-block">
                Make your first deposit →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {transactions.slice(0, 5).map((t) => (
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
