'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ghanaCardNumber: '',
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await customerApi.create(form);
      router.push('/collector/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to onboard customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/collector/dashboard">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="dashboard-title">Onboard Customer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customer will receive an SMS to complete verification on their device.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                required
              />
            </div>
            <Input
              label="Phone"
              type="tel"
              placeholder="+233241234567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              required
            />
            <Input
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            <Input
              label="Ghana Card (optional)"
              placeholder="GHA-123456789-0"
              value={form.ghanaCardNumber}
              onChange={(e) => update('ghanaCardNumber', e.target.value)}
            />
            {error ? (
              <p className="text-sm text-debit bg-red-50 rounded-lg px-3 py-2">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" loading={loading}>
              Onboard Customer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
