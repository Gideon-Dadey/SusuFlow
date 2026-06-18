'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { depositApi, customerApi } from '@/lib/api';
import { formatGhs } from '@/lib/utils';
import { HandCoins, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function CollectorDashboard() {
  const { data: deposits } = useQuery({
    queryKey: ['collector-deposits'],
    queryFn: () => depositApi.list({ status: 'completed' }),
  });

  const { data: customers } = useQuery({
    queryKey: ['collector-customers'],
    queryFn: () => customerApi.list(),
  });

  const todayDeposits = (deposits?.items || []).filter(
    (t) => new Date(t.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayTotal = todayDeposits.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Collector Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Assist customers with cashless deposits</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Today's Deposits"
          value={formatGhs(todayTotal)}
          subtitle={`${todayDeposits.length} assisted`}
          icon={Wallet}
        />
        <StatCard
          title="My Customers"
          value={String(customers?.items?.length || 0)}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/collector/customers/new">
          <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
            <Users className="h-6 w-6" />
            Onboard Customer
          </Button>
        </Link>
        <Link href="/collector/deposit">
          <Button className="w-full h-auto py-4 flex-col gap-2">
            <HandCoins className="h-6 w-6" />
            Assist Deposit
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Assisted Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {todayDeposits.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No deposits assisted today</p>
          ) : (
            todayDeposits.map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
