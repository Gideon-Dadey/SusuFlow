'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customerApi } from '@/lib/api';
import { ArrowLeft, UserPlus, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';

export default function OnboardCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      return customerApi.create({
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        ghanaCardNumber: ghanaCardNumber || undefined,
      });
    },
    onSuccess: (newCustomer) => {
      setSuccess('Customer successfully registered!');
      queryClient.invalidateQueries({ queryKey: ['staff-customers'] });
      setTimeout(() => {
        router.push(`/staff/customers/${newCustomer.id}`);
      }, 1000);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Onboarding failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/staff/customers">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="dashboard-title">Onboard Customer</h1>
          <p className="text-xs text-muted-foreground">Register a new customer and open their Susu savings wallet</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Customer Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">Fill out the profile details to complete registration</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                placeholder="Ama"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                placeholder="Asante"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="ama@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+233201234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ghana Card Number"
                placeholder="GHA-123456789-0"
                value={ghanaCardNumber}
                onChange={(e) => setGhanaCardNumber(e.target.value)}
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <Input
              label="Residential Address"
              placeholder="House 12, Accra Street"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {error ? (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                {success}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full font-semibold"
              loading={mutation.isPending}
            >
              Complete Onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
