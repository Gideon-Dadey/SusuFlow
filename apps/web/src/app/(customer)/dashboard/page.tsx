'use client';

import { useQuery } from '@tanstack/react-query';
import { BalanceCard } from '@/components/financial/balance-card';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi } from '@/lib/api';
import { getGreeting } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { TransactionListSkeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Wallet, FileText, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: deposits, isLoading } = useQuery({
    queryKey: ['deposits'],
    queryFn: () => depositApi.list({ status: 'completed' }),
  });

  // Query customers to find matching customer profile
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => import('@/lib/api').then((m) => m.customerApi.list()),
  });

  const activeCustomer =
    customersData?.items?.find((c) => c.user?.id === user?.id) ||
    customersData?.items?.[0];

  // Query actual wallet balance from ledger
  const { data: walletData } = useQuery({
    queryKey: ['customer-wallet', activeCustomer?.id],
    queryFn: () =>
      activeCustomer
        ? import('@/lib/api').then((m) => m.customerApi.getWallet(activeCustomer.id))
        : Promise.resolve(null),
    enabled: !!activeCustomer,
  });

  const balance = walletData?.balance || 0;

  const transactions = deposits?.items || [];
  const todayTotal = transactions
    .filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="dashboard-subtitle text-muted-foreground">{getGreeting()},</p>
        <h2 className="dashboard-title text-foreground">{user?.firstName}</h2>
      </div>

      <BalanceCard balance={balance} todayChange={todayTotal} />

      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/deposit', label: 'Deposit', icon: Wallet },
          { href: '/transactions', label: 'History', icon: FileText },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-secondary/40 hover:shadow-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary">
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
            transactions.slice(0, 5).map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
