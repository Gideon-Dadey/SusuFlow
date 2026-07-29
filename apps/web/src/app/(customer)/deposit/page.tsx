"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/financial/money-display";
import { depositApi, userApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useOfflineSync } from "@/components/offline-sync-provider";
import { CheckCircle, ArrowLeft, Clock, WifiOff, Loader2 } from "lucide-react";
import Link from "next/link";

const QUICK_AMOUNTS = [10, 50, 100, 500];
const PAYMENT_METHODS = [
  { id: "mtn_momo", label: "MTN Mobile Money", emoji: "📱" },
  { id: "telecel_cash", label: "Telecel Cash", emoji: "📱" },
];

export default function DepositPage() {
  const router = useRouter();
  const { queueDeposit, isOnline } = useOfflineSync();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    paymentUrl?: string;
    isOfflineQueued?: boolean;
  } | null>(null);

  // Query current user's profile to retrieve the associated customer account and details
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
  });

  // Pre-fill phone number with user's profile phone
  useEffect(() => {
    if (userProfile?.phone && !phone) {
      setPhone(userProfile.phone);
    }
  }, [userProfile, phone]);

  const handleDeposit = async () => {
    setLoading(true);
    setError("");
    const idempotencyKey = `dep_${Date.now()}`;
    const depositAmount = parseFloat(amount);

    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new TypeError("Failed to fetch");
      }

      const profile = await userApi.getMe();
      const customer = profile.customer;
      if (!customer)
        throw new Error("Customer profile not found. Please contact support.");

      const res = await depositApi.initiate({
        amount: depositAmount,
        paymentMethod: method,
        customerId: customer.id,
        payerPhone: phone,
        idempotencyKey,
      });

      setResult({
        reference: res.reference,
        paymentUrl: res.payment.paymentUrl,
        isOfflineQueued: false,
      });
      setStep(3);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "";
      const isNetworkError =
        typeof window !== "undefined" &&
        (!navigator.onLine ||
          errMsg.toLowerCase().includes("reach") ||
          errMsg.toLowerCase().includes("fetch") ||
          errMsg.toLowerCase().includes("network") ||
          errMsg.toLowerCase().includes("failed to fetch"));

      if (isNetworkError) {
        try {
          const customer = userProfile?.customer;
          const customerName = userProfile
            ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
            : "Customer";

          if (customer) {
            const queuedItem = queueDeposit({
              amount: depositAmount,
              paymentMethod: method,
              customerId: customer.id,
              payerPhone: phone,
              customerName,
              idempotencyKey,
            });

            setResult({
              reference: queuedItem.reference,
              isOfflineQueued: true,
            });
            setStep(3);
            return;
          }
        } catch (queueErr) {
          console.error("Failed to queue deposit offline", queueErr);
        }
      }
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && result) {
    const isOffline = result.isOfflineQueued;

    return (
      <div className="space-y-6 text-center py-8 max-w-md mx-auto">
        <div className="flex justify-center">
          {isOffline ? (
            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-12 w-12 animate-pulse" />
              <WifiOff className="absolute bottom-0 right-0 h-6 w-6 bg-card border-2 border-card rounded-full p-1" />
            </div>
          ) : (
            <CheckCircle className="h-16 w-16 text-credit" />
          )}
        </div>

        <h2 className="dashboard-title text-xl font-extrabold tracking-tight">
          {isOffline ? "Deposit Saved Offline!" : "Payment Initiated!"}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {isOffline
            ? "Your connection is currently slow or offline. We have registered your deposit request locally. SusuFlow will automatically submit and execute it as soon as your network recovers."
            : "Confirm the MoMo prompt on your phone to complete your deposit."}
        </p>

        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="p-4 space-y-2.5 text-left text-sm">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Amount</span>
              <MoneyDisplay amount={parseFloat(amount)} size="sm" />
            </div>
            <div className="flex justify-between items-center pt-1.5">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted rounded border border-border/60">
                {result.reference}
              </span>
            </div>
            {isOffline && (
              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-muted-foreground">Sync Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                  <Loader2 className="h-3 w-3 animate-spin" /> Awaiting Internet
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {!isOffline && result.paymentUrl ? (
          <a href={result.paymentUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full">Open Payment Page</Button>
          </a>
        ) : null}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/dashboard")}
        >
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

      {userProfile?.customer?.kycStatus !== "approved" &&
        userProfile?.customer?.kycStatus !== "verified" && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
            <span className="text-xl shrink-0">🛡️</span>
            <div className="space-y-1">
              <div className="font-semibold text-foreground text-sm">
                Identity Verification Notice
              </div>
              <p className="text-muted-foreground leading-relaxed">
                In accordance with Bank of Ghana anti-fraud regulations, please
                upload your Ghana Card / ID document to complete verification.
              </p>
              <Link
                href="/kyc"
                className="inline-flex items-center text-primary font-semibold hover:underline pt-1"
              >
                Complete Verification Now →
              </Link>
            </div>
          </div>
        )}

      <div className="flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`}
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
                  method === m.id
                    ? "border-primary bg-primary-100"
                    : "border-border"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="font-medium">{m.label}</span>
                {method === m.id ? (
                  <span className="ml-auto text-primary text-sm font-medium">
                    Selected
                  </span>
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
              <p className="text-sm text-debit bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            <Button
              className="w-full"
              loading={loading}
              onClick={handleDeposit}
            >
              Pay GHS {amount}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
