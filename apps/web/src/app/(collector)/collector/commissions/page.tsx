'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { depositApi } from '@/lib/api';
import { formatGhs } from '@/lib/utils';
import { faPercent, faWallet } from '@fortawesome/free-solid-svg-icons';

const COMMISSION_RATE = 0.02;

export default function CollectorCommissionsPage() {
  const { data } = useQuery({
    queryKey: ['collector-commissions'],
    queryFn: () => depositApi.list({ status: 'completed' }),
  });

  const completed = data?.items ?? [];
  const totalVolume = completed.reduce((s, t) => s + Number(t.amount), 0);
  const totalCommission = totalVolume * COMMISSION_RATE;

  const thisMonth = completed.filter((t) => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthVolume = thisMonth.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title hidden lg:block">Commissions</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="This month (est.)"
          value={formatGhs(monthVolume * COMMISSION_RATE)}
          subtitle={`${thisMonth.length} completed deposits`}
          icon={faPercent}
          iconBgClassName="dashboard-icon-emerald"
          iconClassName="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="All-time assisted volume"
          value={formatGhs(totalVolume)}
          subtitle={`Est. commission ${formatGhs(totalCommission)}`}
          icon={faWallet}
          iconBgClassName="dashboard-icon-pink"
          iconClassName="text-pink-600 dark:text-pink-400"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How commissions work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            You earn when a customer completes a MoMo deposit you assisted — only after the payment
            gateway confirms success. Cash never passes through your hands.
          </p>
          <p>
            Current estimated rate: <strong className="text-foreground">2%</strong> of verified
            deposit volume. Your company admin can adjust rates and payout schedules in SusuFlow.
          </p>
          <p>
            Commission figures here are estimates for your dashboard. Official payouts appear in
            your company&apos;s payroll or MoMo disbursement cycle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
