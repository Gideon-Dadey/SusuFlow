"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/financial/money-display";
import { customerApi, withdrawalApi, userApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const QUICK_AMOUNTS = [10, 20, 50, 100];
const DISBURSEMENT_METHODS = [
  { id: "mtn_momo", label: "MTN Mobile Money", emoji: "📱" },
  { id: "telecel_cash", label: "Telecel Cash", emoji: "📱" },
];

export default function WithdrawRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ reference: string } | null>(null);

  // Query current user's profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
    placeholderData: (prev) => prev,
  });

  const activeCustomer = userProfile?.customer;

  // Pre-fill phone number with customer profile phone
  useEffect(() => {
    if (userProfile?.phone && !phone) {
      setPhone(userProfile.phone);
    }
  }, [userProfile, phone]);

  // Query actual wallet balance from ledger
  const { data: walletData } = useQuery({
    queryKey: ["customer-wallet", activeCustomer?.id],
    queryFn: () =>
      activeCustomer
        ? customerApi.getWallet(activeCustomer.id)
        : Promise.resolve(null),
    placeholderData: (prev) => prev,
  });

  // Query pending withdrawals
  const { data: withdrawalsData } = useQuery({
    queryKey: ["withdrawals", activeCustomer?.id],
    queryFn: () => withdrawalApi.list({ customer_id: activeCustomer?.id }),
    placeholderData: (prev) => prev,
  });

  const walletBalance = walletData?.balance || 0;
  const pendingRequests =
    withdrawalsData?.items?.filter(
      (w) =>
        w.status === "pending" ||
        w.status === "processing" ||
        w.status === "approved" ||
        w.withdrawal?.status === "requested" ||
        w.withdrawal?.status === "processing" ||
        w.withdrawal?.status === "approved",
    ) || [];

  const pendingSum = pendingRequests.reduce(
    (sum, w) => sum + Number(w.amount),
    0,
  );
  const availableBalance = Math.max(0, walletBalance - pendingSum);

  const handleRequestWithdrawal = async () => {
    setLoading(true);
    setError("");
    try {
      if (!amount || parseFloat(amount) < 10) {
        throw new Error("Minimum withdrawal amount is GHS 10.00");
      }
      if (parseFloat(amount) > availableBalance) {
        throw new Error("Requested amount exceeds available balance.");
      }
      if (!phone) {
        throw new Error("Please specify a disbursement phone number.");
      }

      const res = await withdrawalApi.requestWithdrawal({
        amount: parseFloat(amount),
        disbursementMethod: method,
        disbursementPhone: phone,
      });

      setResult({ reference: res.reference });

      // Invalidate queries to refresh lists and balances
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });

      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Withdrawal request failed",
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && result) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="dashboard-title text-foreground">Request Submitted!</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Your payout request has been registered and is pending approval by our
          staff. You will receive mobile money prompt to confirm once approved.
        </p>
        <Card className="border border-border bg-card">
          <CardContent className="p-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Requested Amount</span>
              <MoneyDisplay amount={parseFloat(amount)} size="sm" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs text-foreground font-semibold">
                {result.reference}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disbursement Wallet</span>
              <span className="text-foreground capitalize">
                {method.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Phone</span>
              <span className="text-foreground">{phone}</span>
            </div>
          </CardContent>
        </Card>
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
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        </Link>
        <h1 className="dashboard-title">Withdraw Funds</h1>
      </div>

      <div className="flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      <Card className="border border-border bg-card">
        <CardContent className="p-4 space-y-2 bg-muted/40 rounded-t-xl border-b border-border">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Wallet Balance:
            </span>
            <span className="text-sm font-medium text-foreground">
              GHS {walletBalance.toFixed(2)}
            </span>
          </div>
          {pendingSum > 0 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Pending Requests:</span>
              <span className="text-red-500 font-medium">
                -GHS {pendingSum.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-dashed border-border pt-1">
            <span className="text-xs font-semibold text-foreground">
              Available to Withdraw:
            </span>
            <span className="text-base font-bold text-primary">
              GHS {availableBalance.toFixed(2)}
            </span>
          </div>
        </CardContent>

        {step === 1 ? (
          <CardContent className="p-6 space-y-4">
            <Input
              label="Amount to Withdraw (GHS)"
              type="number"
              min="10"
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-foreground border-border bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  disabled={a > availableBalance}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
                >
                  GHS {a}
                </button>
              ))}
            </div>
            {error ? (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}
            <Button
              className="w-full"
              disabled={
                !amount ||
                parseFloat(amount) < 10 ||
                parseFloat(amount) > availableBalance
              }
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        ) : (
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Select MoMo Network
              </span>
              <div className="space-y-2">
                {DISBURSEMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      method === m.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="font-semibold text-sm">{m.label}</span>
                    {method === m.id ? (
                      <span className="ml-auto text-primary text-xs font-bold">
                        Selected
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Disbursement MoMo Number"
              type="tel"
              placeholder="0241234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-foreground border-border bg-background"
            />

            {error ? (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                loading={loading}
                onClick={handleRequestWithdrawal}
              >
                Request GHS {amount}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
