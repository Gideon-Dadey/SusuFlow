'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatGhs, formatDate } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faChartPie, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export default function AdminBillingPage() {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['admin-global-billing'],
    queryFn: () => adminApi.getBilling(),
  });

  const subscriptions = billing?.subscriptions ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Platform Revenue & Billing</h1>
        <p className="text-sm text-muted-foreground">Monitor Monthly/Annual Recurring Revenue (MRR/ARR) and tenant SaaS subscription plans</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted/65" />
          <div className="h-48 w-full animate-pulse rounded-lg bg-muted/65" />
        </div>
      ) : (
        <>
          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faChartPie} className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Monthly Recurring (MRR)</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{formatGhs(billing?.monthlyRevenue ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">Sum of active subscription plans</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Annual Run Rate (ARR)</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{formatGhs(billing?.annualRevenue ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">Projected annual collections</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="h-5 w-5 text-sky-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tenant Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{subscriptions.length}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {billing?.activeCount ?? 0} active · {billing?.trialCount ?? 0} on trial
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions Table */}
          <Card className="portal-card border-border/60">
            <CardHeader>
              <CardTitle>Organization Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No subscriptions registered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4">Slug</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Renewal/Period End</th>
                        <th className="py-3 px-4">Last Payment</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {subscriptions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-foreground">
                            {sub.tenant?.name || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                            {sub.tenant?.slug || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase text-foreground">
                              {sub.plan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted-foreground">
                            {formatDate(sub.currentPeriodEnd)}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted-foreground">
                            {sub.lastPaymentAt ? formatDate(sub.lastPaymentAt) : 'No payments yet'}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <StatusBadge status={sub.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
