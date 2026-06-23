'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { CollectionTrendChart } from '@/components/dashboard/collection-trend-chart';
import { CollectionsByStatusChart } from '@/components/dashboard/collections-by-status-chart';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi, customerApi } from '@/lib/api';
import { formatGhs, getInitials } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import Link from 'next/link';
import { faChartLine, faClock, faUsers, faWallet } from '@fortawesome/free-solid-svg-icons';

export default function StaffDashboard() {
  const { data: deposits } = useQuery({
    queryKey: ['staff-deposits'],
    queryFn: () => depositApi.list(),
  });

  const { data: activeCustomers } = useQuery({
    queryKey: ['staff-active-customers'],
    queryFn: () => customerApi.list({ status: 'active' }),
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['staff-all-customers'],
    queryFn: () => customerApi.list(),
  });

  const transactions = deposits?.items || [];
  const recentCustomers = allCustomers?.items || [];
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
          value={String(activeCustomers?.items?.length || 0)}
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

      {/* Recent Deposits and Recent Customers Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Deposits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">No deposits yet</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border/40">
                {transactions.slice(0, 6).map((t) => (
                  <TransactionRow key={t.id} transaction={t} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!recentCustomers || recentCustomers.length === 0 ? (
              <p className="py-8 px-4 text-center text-sm text-muted-foreground">No customers onboarded yet</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border/40">
                {recentCustomers.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/staff/customers/${c.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary font-semibold text-xs">
                        {getInitials(c.user?.firstName, c.user?.lastName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {c.user?.firstName || 'Pending'} {c.user?.lastName || 'Onboarding'}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{c.customerNumber}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={c.status} />
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-semibold">KYC L{c.kycLevel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
