'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { customerApi } from '@/lib/api';
import { DashboardPageBar } from '@/components/layout/dashboard-page-bar';
import { OnboardCustomerForm } from '@/components/collector/onboard-customer-form';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { CustomerListSkeleton, CustomersPageSkeleton } from '@/components/ui/skeleton';

function CollectorCustomersContent() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['collector-customers'],
    queryFn: () => customerApi.list(),
  });

  const customers = data?.items || [];

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setShowForm(true);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <DashboardPageBar
        title="Customers"
        actions={
          <Button size="sm" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" />
            {showForm ? 'Close' : 'Add'}
          </Button>
        }
      />

      {showForm ? (
        <OnboardCustomerForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      ) : null}

      <Card>
        <CardContent className="divide-y divide-gray-100 p-0">
          {isLoading ? (
            <CustomerListSkeleton count={4} />
          ) : customers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No customers yet</p>
              <Button className="mt-4" size="sm" onClick={() => setShowForm(true)}>
                Add your first customer
              </Button>
            </div>
          ) : (
            customers.map((c) => (
              <Link
                key={c.id}
                href={`/collector/deposit?customer=${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary">
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

export default function CollectorCustomersPage() {
  return (
    <Suspense fallback={<CustomersPageSkeleton />}>
      <CollectorCustomersContent />
    </Suspense>
  );
}
