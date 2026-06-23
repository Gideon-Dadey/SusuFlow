'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSearch, faSpinner, faShield } from '@fortawesome/free-solid-svg-icons';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState<string>('');

  const { data: customersData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-global-customers', search],
    queryFn: () => adminApi.getCustomers({ search }),
  });

  const customers = customersData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Platform Savers Directory</h1>
      </div>

      {/* Search Input */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, or saver ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            {isFetching && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3.5 w-3.5 animate-spin text-primary" />
                Searching...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savers Table */}
      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Registered Savers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faUsers} className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No savers found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Saver</th>
                    <th className="py-3 px-4">Customer Number</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4 text-center">KYC Level</th>
                    <th className="py-3 px-4">KYC Status</th>
                    <th className="py-3 px-4 text-right">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {customers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {c.user ? (
                          <>
                            <span>
                              {c.user.firstName} {c.user.lastName}
                            </span>
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              {c.user.email} · {c.user.phone || 'No phone'}
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-foreground whitespace-nowrap">
                        {c.customerNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {c.tenant?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          <FontAwesomeIcon icon={faShield} className="h-3 w-3" />
                          Level {c.kycLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-xs text-foreground whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            c.kycStatus === 'approved'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {c.kycStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={c.status} />
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
