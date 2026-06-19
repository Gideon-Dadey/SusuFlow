'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerApi } from '@/lib/api';

type OnboardCustomerFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function OnboardCustomerForm({ onSuccess, onCancel }: OnboardCustomerFormProps) {
  const queryClient = useQueryClient();
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
      await queryClient.invalidateQueries({ queryKey: ['collector-customers'] });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        ghanaCardNumber: '',
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Add customer</CardTitle>
        {onCancel ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
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
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-debit">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Add customer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
