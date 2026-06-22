'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { CustomerListSkeleton } from '@/components/ui/skeleton';
import { Plus, Search, Filter } from 'lucide-react';

export default function StaffCustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['staff-customers', search, status],
    queryFn: () => customerApi.list({ search: search || undefined, status: status || undefined }),
  });

  const customers = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="dashboard-title">Customers</h1>
          <p className="text-xs text-muted-foreground">Manage and onboard Susu company customers</p>
        </div>
        <Link href="/staff/customers/new">
          <Button className="flex items-center gap-1.5 font-semibold text-xs py-1.5">
            <Plus className="h-4 w-4" />
            Onboard Customer
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="py-2 px-3 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <CustomerListSkeleton count={4} />
          ) : customers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No customers found</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/staff/customers/${c.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary font-semibold text-sm">
                    {getInitials(c.user?.firstName, c.user?.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">
                      {c.user?.firstName || 'Pending'} {c.user?.lastName || 'Onboarding'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.customerNumber}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={c.status} />
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">KYC L{c.kycLevel}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
