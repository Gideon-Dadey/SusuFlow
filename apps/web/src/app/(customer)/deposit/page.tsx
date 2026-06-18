'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoneyDisplay } from '@/components/financial/money-display';
import { depositApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QUICK_AMOUNTS = [10, 50, 100, 500];
const PAYMENT_METHODS = [
  { id: 'mtn_momo', label: 'MTN Mobile Money', emoji: '📱' },
  { id: 'telecel_cash', label: 'Telecel Cash', emoji: '📱' },
];

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn_momo');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; paymentUrl?: string } | null>(null);

  const handleDeposit = async () => {
    setLoading(true);
    setError('');
    try {
      // In production, customerId comes from customer profile API
      const customers = await import('@/lib/api').then((m) => m.customerApi.list());
      const customer = customers.items?.[0];
      if (!customer) throw new Error('Customer profile not found. Please contact support.');

      const res = await depositApi.initiate({
        amount: parseFloat(amount),
        paymentMethod: method,
        customerId: customer.id,
        payerPhone: phone,
        idempotencyKey: `dep_${Date.now()}`,
      });

      setResult({ reference: res.reference, paymentUrl: res.payment.paymentUrl });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && result) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-credit" />
        </div>
        <h2 className="dashboard-title">Payment Initiated!</h2>
        <p className="text-muted-foreground">
          Confirm the MoMo prompt on your phone to complete your deposit.
        </p>
        <Card>
          <CardContent className="p-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <MoneyDisplay amount={parseFloat(amount)} size="sm" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{result.reference}</span>
            </div>
          </CardContent>
        </Card>
        {result.paymentUrl ? (
          <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full">Open Payment Page</Button>
          </a>
        ) : null}
        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="dashboard-title">Make a Deposit</h1>
      </div>

      <div className="flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>How much would you like to save?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Amount (GHS)"
              type="number"
              min="1"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
                >
                  GHS {a}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={!amount || parseFloat(amount) < 1}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <p className="text-sm text-muted-foreground">
              Depositing <MoneyDisplay amount={parseFloat(amount)} size="sm" />
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                  method === m.id ? 'border-primary bg-primary-100' : 'border-border'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-medium">{m.label}</span>
                {method === m.id ? (
                  <span className="ml-auto text-primary text-sm font-medium">Selected</span>
                ) : null}
              </button>
            ))}
            <Input
              label="MoMo Number"
              type="tel"
              placeholder="+233241234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error ? (
              <p className="text-sm text-debit bg-red-50 rounded-lg px-3 py-2">{error}</p>
            ) : null}
            <Button className="w-full" loading={loading} onClick={handleDeposit}>
              Pay GHS {amount}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
