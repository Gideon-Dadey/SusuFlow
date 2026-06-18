'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi, customerApi } from '@/lib/api';
import { formatGhs } from '@/lib/utils';
import { Wallet, Users, TrendingUp, Clock } from 'lucide-react';

export default function StaffDashboard() {
  const { data: deposits } = useQuery({
    queryKey: ['staff-deposits'],
    queryFn: () => depositApi.list(),
  });

  const { data: customers } = useQuery({
    queryKey: ['staff-customers'],
    queryFn: () => customerApi.list({ status: 'active' }),
  });

  const transactions = deposits?.items || [];
  const todayDeposits = transactions.filter(
    (t) =>
      t.status === 'completed' &&
      new Date(t.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayTotal = todayDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const pending = transactions.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Real-time overview of your susu operations</p>
      </div>

      <div className="portal-metric-grid">
        <StatCard
          title="Deposits Today"
          value={formatGhs(todayTotal)}
          icon={Wallet}
          trend={{ value: `${todayDeposits.length} txns`, positive: true }}
        />
        <StatCard
          title="Active Customers"
          value={String(customers?.items?.length || 0)}
          icon={Users}
        />
        <StatCard
          title="Pending"
          value={String(pending)}
          subtitle="Awaiting confirmation"
          icon={Clock}
        />
        <StatCard
          title="Total Volume"
          value={formatGhs(
            transactions
              .filter((t) => t.status === 'completed')
              .reduce((s, t) => s + Number(t.amount), 0),
          )}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No deposits yet</p>
          ) : (
            transactions.slice(0, 8).map((t) => <TransactionRow key={t.id} transaction={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
