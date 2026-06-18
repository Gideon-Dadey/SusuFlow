'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { customerApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export default function CollectorCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collector-customers'],
    queryFn: () => customerApi.list(),
  });

  const customers = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">My Customers</h1>
        <Link href="/collector/customers/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No customers yet</p>
              <Link href="/collector/customers/new">
                <Button className="mt-4" size="sm">
                  Onboard your first customer
                </Button>
              </Link>
            </div>
          ) : (
            customers.map((c) => (
              <Link
                key={c.id}
                href={`/collector/deposit?customer=${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary text-sm font-medium">
                  {getInitials(c.user?.firstName, c.user?.lastName)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {c.user?.firstName || 'Customer'} {c.user?.lastName || c.customerNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.user?.phone || c.customerNumber}</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
