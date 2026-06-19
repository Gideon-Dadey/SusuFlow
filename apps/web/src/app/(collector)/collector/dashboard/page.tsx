'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  faClock,
  faHandHoldingDollar,
  faPercent,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { TransactionRow } from '@/components/financial/transaction-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi, customerApi } from '@/lib/api';
import { formatGhs, getGreeting } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const COMMISSION_RATE = 0.02;

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function isYesterday(date: string) {
  const d = new Date(date);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

export default function CollectorDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: deposits } = useQuery({
    queryKey: ['collector-deposits'],
    queryFn: () => depositApi.list(),
  });

  const { data: customers } = useQuery({
    queryKey: ['collector-customers'],
    queryFn: () => customerApi.list(),
  });

  const transactions = deposits?.items ?? [];
  const customerItems = customers?.items ?? [];

  const todayCompleted = transactions.filter((t) => t.status === 'completed' && isToday(t.createdAt));
  const yesterdayCompleted = transactions.filter(
    (t) => t.status === 'completed' && isYesterday(t.createdAt),
  );
  const pending = transactions.filter((t) => t.status === 'pending');
  const todayTotal = todayCompleted.reduce((s, t) => s + Number(t.amount), 0);
  const yesterdayTotal = yesterdayCompleted.reduce((s, t) => s + Number(t.amount), 0);
  const volumeDelta =
    yesterdayTotal > 0
      ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
      : todayTotal > 0
        ? 100
        : 0;
  const mtdCommission = transactions
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount) * COMMISSION_RATE, 0);

  return (
    <div className="space-y-5 lg:space-y-6">
      <Card className="overflow-hidden border-border shadow-card">
        <CardContent className="flex flex-row items-center gap-3 p-4 sm:gap-6 sm:p-6 lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground sm:text-sm">
              {getGreeting()}, {user?.firstName} 👋
            </p>
            <h1 className="mt-0.5 text-base font-bold leading-snug tracking-tight text-foreground sm:mt-1 sm:text-2xl sm:leading-tight lg:text-3xl">
              {todayCompleted.length} deposit{todayCompleted.length === 1 ? '' : 's'} assisted today
            </h1>
            <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground sm:mt-2 sm:text-sm sm:leading-normal">
              {todayCompleted.length} today
              {yesterdayCompleted.length > 0 ? (
                <>
                  {' '}
                  vs {yesterdayCompleted.length} yesterday ({volumeDelta >= 0 ? '+' : ''}
                  {volumeDelta}%)
                </>
              ) : (
                <> · {formatGhs(todayTotal)} volume</>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-3 border-l border-border pl-3 sm:gap-6 sm:pl-6 lg:gap-8 lg:pl-8">
            <div>
              <p className="text-[0.5625rem] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[0.6875rem]">
                Today&apos;s deposits
              </p>
              <p className="mt-0.5 text-lg font-bold text-foreground sm:mt-1 sm:text-2xl">
                {todayCompleted.length}
              </p>
            </div>
            <div>
              <p className="text-[0.5625rem] font-semibold uppercase tracking-wider text-muted-foreground sm:text-[0.6875rem]">
                Today&apos;s volume
              </p>
              <p className="mt-0.5 text-base font-bold text-foreground sm:mt-1 sm:text-2xl">
                {formatGhs(todayTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:gap-4">
          <QuickActionCard
            href="/collector/deposit"
            title="Assist deposit"
            description="Help a saver pay via MoMo"
            icon={faHandHoldingDollar}
            iconBgClassName="bg-amber-100 dark:bg-amber-500/15"
            iconClassName="text-amber-600 dark:text-amber-400"
          />
          <QuickActionCard
            href="/collector/customers"
            title="Customers"
            description="View and add savers"
            icon={faUsers}
            iconBgClassName="bg-violet-100 dark:bg-violet-500/15"
            iconClassName="text-violet-600 dark:text-violet-400"
          />
          <QuickActionCard
            href="/collector/commissions"
            title="Commissions"
            description="Track your earnings"
            icon={faPercent}
            iconBgClassName="bg-emerald-100 dark:bg-emerald-500/15"
            iconClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>

      <div>
        <h2 className="dashboard-section-title">Performance</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard
          title="Active customers"
          value={String(customerItems.length)}
          subtitle="Assigned to you"
          icon={faUsers}
          iconBgClassName="bg-emerald-100 dark:bg-emerald-500/15"
          iconClassName="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Pending MoMo"
          value={String(pending.length)}
          subtitle="Awaiting gateway confirm"
          icon={faClock}
          iconBgClassName="bg-amber-100 dark:bg-amber-500/15"
          iconClassName="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Month commission"
          value={formatGhs(mtdCommission)}
          subtitle="Est. 2% on assisted volume"
          icon={faPercent}
          iconBgClassName="bg-violet-100 dark:bg-violet-500/15"
          iconClassName="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          title="All-time assisted"
          value={formatGhs(
            transactions
              .filter((t) => t.status === 'completed')
              .reduce((s, t) => s + Number(t.amount), 0),
          )}
          subtitle={`${transactions.filter((t) => t.status === 'completed').length} verified deposits`}
          icon={faWallet}
          iconBgClassName="bg-pink-100 dark:bg-pink-500/15"
          iconClassName="text-pink-600 dark:text-pink-400"
        />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending verifications</CardTitle>
            <Link href="/collector/deposits" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No pending MoMo payments — you&apos;re all caught up.
              </p>
            ) : (
              pending.slice(0, 5).map((t) => <TransactionRow key={t.id} transaction={t} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent assisted deposits</CardTitle>
            <Link href="/collector/deposits" className="text-sm font-medium text-primary hover:underline">
              History
            </Link>
          </CardHeader>
          <CardContent>
            {todayCompleted.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No completed deposits today. Start with Assist deposit.
              </p>
            ) : (
              todayCompleted.slice(0, 5).map((t) => <TransactionRow key={t.id} transaction={t} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
