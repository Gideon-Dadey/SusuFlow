'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { customerApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { CustomerListSkeleton } from '@/components/ui/skeleton';

export default function StaffCustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff-customers'],
    queryFn: () => customerApi.list(),
  });

  const customers = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">Customers</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <CustomerListSkeleton count={4} />
          ) : customers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No customers found</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/staff/customers/${c.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary font-medium text-sm">
                    {getInitials(c.user?.firstName, c.user?.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {c.user?.firstName} {c.user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{c.customerNumber}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={c.status} />
                    <p className="text-xs text-muted-foreground mt-1">KYC L{c.kycLevel}</p>
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
