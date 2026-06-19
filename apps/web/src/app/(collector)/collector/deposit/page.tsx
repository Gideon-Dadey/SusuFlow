'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/financial/money-display';
import { customerApi, depositApi } from '@/lib/api';
import { FormCardSkeleton } from '@/components/ui/skeleton';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

function AssistDepositContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('customer');

  const { data: customersData } = useQuery({
    queryKey: ['collector-customers'],
    queryFn: () => customerApi.list(),
  });

  const [customerId, setCustomerId] = useState(preselectedId || '');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ reference: string } | null>(null);

  const customers = customersData?.items || [];
  const selected = customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (selected?.user?.phone) setPhone(selected.user.phone);
  }, [selected]);

  const handleSubmit = async () => {
    if (!customerId || !amount || !phone) return;
    setLoading(true);
    setError('');
    try {
      const res = await depositApi.initiate({
        amount: parseFloat(amount),
        paymentMethod: 'mtn_momo',
        customerId,
        payerPhone: phone,
        idempotencyKey: `col_dep_${Date.now()}`,
      });
      setSuccess({ reference: res.reference });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center py-8">
        <CheckCircle className="h-16 w-16 text-credit mx-auto" />
        <h2 className="dashboard-title">MoMo Prompt Sent!</h2>
        <p className="text-muted-foreground">
          Ask the customer to confirm on their phone. You cannot enter their PIN.
        </p>
        <Card>
          <CardContent className="p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{success.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <MoneyDisplay amount={parseFloat(amount)} size="sm" />
            </div>
          </CardContent>
        </Card>
        <Link href="/collector/dashboard">
          <Button variant="outline" className="w-full">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.user?.firstName} {c.user?.lastName} — {c.customerNumber}
              </option>
            ))}
          </select>

          {selected ? (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">
                {selected.user?.firstName} {selected.user?.lastName}
              </p>
              <p className="text-muted-foreground">{selected.user?.phone}</p>
            </div>
          ) : null}

          <Input
            label="Deposit Amount (GHS)"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Customer MoMo Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error ? (
            <p className="text-sm text-debit bg-red-50 rounded-lg px-3 py-2">{error}</p>
          ) : null}

          <Button
            className="w-full"
            loading={loading}
            disabled={!customerId || !amount || !phone}
            onClick={handleSubmit}
          >
            Send MoMo Prompt to Customer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CollectorDepositPage() {
  return (
    <Suspense fallback={<FormCardSkeleton />}>
      <AssistDepositContent />
    </Suspense>
  );
}
