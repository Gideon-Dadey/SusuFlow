'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { formatGhs, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faFilter, faFileCsv, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function AdminWithdrawalsPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch tenants for filtering dropdown
  const { data: tenantsData } = useQuery({
    queryKey: ['admin-tenants-list'],
    queryFn: () => adminApi.listTenants(),
  });

  // Fetch global withdrawals list
  const { data: withdrawalsData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-global-withdrawals', selectedTenant, selectedStatus],
    queryFn: () =>
      adminApi.listWithdrawals({
        tenant_id: selectedTenant || undefined,
        status: selectedStatus || undefined,
      }),
  });

  const tenants = tenantsData?.items ?? [];
  const withdrawals = withdrawalsData?.items ?? [];

  const handleExportCsv = () => {
    if (!withdrawals.length) return;
    const headers = ['Date', 'Reference', 'Tenant Name', 'Customer Name', 'Disbursement Phone', 'Disbursement Method', 'Amount (GHS)', 'Status'];
    const rows = withdrawals.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.reference,
      t.tenant?.name || 'N/A',
      t.customer?.user ? `"${t.customer.user.firstName} ${t.customer.user.lastName}"` : 'N/A',
      t.withdrawal?.disbursementPhone || 'N/A',
      t.withdrawal?.disbursementMethod || 'N/A',
      t.amount,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `global_withdrawals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="text-2xl font-bold tracking-tight">Global Withdrawals</h1>
          <p className="text-sm text-muted-foreground">System-wide log of saver cash withdrawals across all registered tenants</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          disabled={!withdrawals.length}
          className="text-xs font-semibold"
        >
          <FontAwesomeIcon icon={faFileCsv} className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Export CSV
        </Button>
      </div>

      {/* Filter panel */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
              Filter By:
            </div>

            <div className="flex flex-1 flex-wrap gap-3">
              {/* Tenant filter */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All Organizations</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="requested">Requested</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {isFetching && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin text-primary" />
                Updating...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main ledger list */}
      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Withdrawals Feed ({withdrawals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faHistory} className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No withdrawals match selected filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Saver Name</th>
                    <th className="py-3 px-4">Disbursement Target</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {withdrawals.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                        {tx.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {tx.tenant?.name || 'Platform'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {tx.customer?.user
                          ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                          : 'N/A'}
                        {tx.customer?.customerNumber && (
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            {tx.customer.customerNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {tx.withdrawal?.disbursementPhone ? (
                          <>
                            <span className="font-medium text-foreground">{tx.withdrawal.disbursementPhone}</span>
                            <span className="block text-[10px] text-muted-foreground capitalize">
                              {tx.withdrawal.disbursementMethod.replace(/_/g, ' ')}
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatGhs(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
