'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adminApi, type CreateTenantPayload } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CreateTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTenantPayload>({
    slug: '',
    name: '',
    email: '',
    phone: '',
    plan: 'growth',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
  });
  const [credentials, setCredentials] = useState<{
    tenantSlug: string;
    email: string;
    temporaryPassword?: string;
    loginUrl: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateTenantPayload) => adminApi.createTenant(data),
    onSuccess: (result) => {
      setCredentials(result.credentials);
    },
  });

  const update = (field: keyof CreateTenantPayload, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      slug: form.slug.toLowerCase().trim(),
      adminPassword: form.adminPassword || undefined,
      phone: form.phone || undefined,
      adminPhone: form.adminPhone || undefined,
    });
  };

  if (credentials) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="page-header">
          <h1>Organization provisioned</h1>
          <p>Share these details with the susu company after your demo and payment</p>
        </div>
        <Card className="portal-card border-secondary/30">
          <CardHeader>
            <CardTitle>Login credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-foreground">Tenant slug:</span>{' '}
              <code className="rounded bg-muted px-2 py-0.5">{credentials.tenantSlug}</code>
            </p>
            <p>
              <span className="font-medium text-foreground">Admin email:</span>{' '}
              {credentials.email}
            </p>
            {credentials.temporaryPassword ? (
              <p>
                <span className="font-medium text-foreground">Temporary password:</span>{' '}
                <code className="rounded bg-muted px-2 py-0.5">{credentials.temporaryPassword}</code>
              </p>
            ) : null}
            <p>
              <span className="font-medium text-foreground">Login URL:</span>{' '}
              {credentials.loginUrl}
            </p>
            <p className="text-muted-foreground">
              The organization starts on a 14-day trial. Activate manually after payment or use
              Collect payment from the tenants list.
            </p>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => router.push('/admin/tenants')}>View all tenants</Button>
              <Link href="/admin/tenants/new">
                <Button variant="outline">Provision another</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="page-header">
        <h1>Create organization</h1>
        <p>Provision a new susu company after demo and agreement</p>
      </div>

      <Card className="portal-card">
        <CardHeader>
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="URL slug"
              placeholder="xyz-susu"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              required
            />
            <Input
              label="Company name"
              placeholder="XYZ Susu Company"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            <Input
              label="Company email"
              type="email"
              placeholder="hello@xyzsusu.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            <Input
              label="Company phone"
              placeholder="+233201234567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Plan</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={form.plan}
                onChange={(e) => update('plan', e.target.value)}
              >
                <option value="starter">Starter (trial)</option>
                <option value="growth">Growth (GHS 299/mo)</option>
                <option value="enterprise">Enterprise (manual)</option>
              </select>
            </div>

            <hr className="border-border" />

            <p className="text-sm font-medium text-foreground">Company administrator</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={form.adminFirstName}
                onChange={(e) => update('adminFirstName', e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={form.adminLastName}
                onChange={(e) => update('adminLastName', e.target.value)}
                required
              />
            </div>
            <Input
              label="Admin email"
              type="email"
              value={form.adminEmail}
              onChange={(e) => update('adminEmail', e.target.value)}
              required
            />
            <Input
              label="Admin phone"
              value={form.adminPhone}
              onChange={(e) => update('adminPhone', e.target.value)}
            />
            <Input
              label="Admin password (optional)"
              type="password"
              placeholder="Auto-generated if blank"
              value={form.adminPassword}
              onChange={(e) => update('adminPassword', e.target.value)}
            />

            {mutation.isError ? (
              <p className="text-sm text-destructive">
                {(mutation.error as Error)?.message || 'Failed to create organization'}
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending}>
                Provision organization
              </Button>
              <Link href="/admin/tenants">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
