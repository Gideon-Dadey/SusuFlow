'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { CollectionTrendChart } from '@/components/dashboard/collection-trend-chart';
import { CollectionsByStatusChart } from '@/components/dashboard/collections-by-status-chart';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi, customerApi } from '@/lib/api';
import { formatGhs } from '@/lib/utils';
import { faChartLine, faClock, faUsers, faWallet } from '@fortawesome/free-solid-svg-icons';

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

      {/* KPI stat cards */}
      <div className="portal-metric-grid">
        <StatCard
          title="Deposits Today"
          value={formatGhs(todayTotal)}
          icon={faWallet}
          iconBgClassName="dashboard-icon-emerald"
          iconClassName="text-emerald-600 dark:text-emerald-400"
          trend={{ value: `${todayDeposits.length} txns`, positive: true }}
        />
        <StatCard
          title="Active Customers"
          value={String(customers?.items?.length || 0)}
          icon={faUsers}
          iconBgClassName="dashboard-icon-sky"
          iconClassName="text-sky-600 dark:text-sky-400"
        />
        <StatCard
          title="Pending"
          value={String(pending)}
          subtitle="Awaiting confirmation"
          icon={faClock}
          iconBgClassName="dashboard-icon-amber"
          iconClassName="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Total Volume"
          value={formatGhs(
            transactions
              .filter((t) => t.status === 'completed')
              .reduce((s, t) => s + Number(t.amount), 0),
          )}
          icon={faChartLine}
          iconBgClassName="dashboard-icon-violet"
          iconClassName="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <CollectionTrendChart transactions={transactions} />
        <CollectionsByStatusChart transactions={transactions} />
      </div>

      {/* Recent deposits table */}
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
