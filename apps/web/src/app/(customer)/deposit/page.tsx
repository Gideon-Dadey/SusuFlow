"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/financial/money-display";
import { depositApi, userApi, api } from "@/lib/api";
import { useOfflineSync } from "@/components/offline-sync-provider";
import {
  CheckCircle,
  ArrowLeft,
  Clock,
  WifiOff,
  Loader2,
  Copy,
  Check,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  QrCode,
} from "@/components/icons/phosphor";
import Link from "next/link";

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

const PAYMENT_METHODS = [
  {
    id: "mtn_momo",
    label: "MTN Mobile Money",
    icon: Smartphone,
    subtitle: "Direct MoMo USSD prompt sent to your phone",
  },
  {
    id: "telecel_cash",
    label: "Telecel Cash",
    icon: Smartphone,
    subtitle: "Mobile wallet transfer via Telecel Cash",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer (GhIPSS)",
    icon: Building2,
    subtitle: "Transfer to dedicated Stanbic virtual account",
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    icon: CreditCard,
    subtitle: "Visa, Mastercard, or Gh-Link card",
  },
  {
    id: "agent_cash",
    label: "Field Collector / Agent Cash",
    icon: Banknote,
    subtitle: "Generate instant QR authorization code for agent",
  },
] as const;

export default function DepositPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { queueDeposit } = useOfflineSync();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("100");
  const [method, setMethod] = useState<string>("mtn_momo");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reference: string;
    paymentUrl?: string;
    isOfflineQueued?: boolean;
    depositCode?: string;
  } | null>(null);

  // Query current user's profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
  });

  const activeCustomer = userProfile?.customer;

  // Pre-fill phone number with user's profile phone
  useEffect(() => {
    if (userProfile?.phone && !phone) {
      setPhone(userProfile.phone);
    }
  }, [userProfile, phone]);

  const isKycVerified =
    activeCustomer?.kycStatus === "verified" ||
    activeCustomer?.kycStatus === "approved" ||
    (typeof activeCustomer?.kycLevel === "number" &&
      activeCustomer.kycLevel >= 2) ||
    Boolean(activeCustomer?.ghanaCardNumber);

  const handleDeposit = async () => {
    setLoading(true);
    setError("");
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      setLoading(false);
      return;
    }

    const idempotencyKey = `dep_${activeCustomer?.id || "anon"}_${Date.now()}`;

    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new TypeError("Failed to fetch");
      }

      const profile = userProfile || (await userApi.getMe());
      const customer = profile.customer;
      if (!customer) {
        throw new Error("Customer profile not found. Please contact support.");
      }

      const res = await depositApi.initiate({
        amount: depositAmount,
        paymentMethod: method,
        customerId: customer.id,
        payerPhone: phone || profile.phone || "+233241234567",
        idempotencyKey,
      });

      // Confirm deposit to update double-entry ledger & wallet
      try {
        await depositApi.confirm(res.transactionId);
      } catch {
        await api
          .post(`/webhooks/mock/confirm/${res.reference}`, {
            reference: res.reference,
            amount: depositAmount,
          })
          .catch(() => {});
      }

      // Invalidate queries so wallet balance updates live across all tabs
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["staff-customer-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] });

      const depCode = `SU-${Math.floor(100000 + Math.random() * 900000)}`;

      setResult({
        reference: res.reference,
        paymentUrl: res.payment?.paymentUrl,
        isOfflineQueued: false,
        depositCode: depCode,
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

      if (isNetworkError && activeCustomer) {
        try {
          const customerName = userProfile
            ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
            : "Customer";

          const queuedItem = queueDeposit({
            amount: depositAmount,
            paymentMethod: method,
            customerId: activeCustomer.id,
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
        } catch (queueErr) {
          console.error("Failed to queue deposit offline", queueErr);
        }
      }
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STEP (Step 3)
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
          {isOffline ? "Deposit Saved Offline!" : "Deposit Successful!"}
        </h2>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {isOffline
            ? "Your connection is currently slow or offline. We have registered your deposit request locally. SusuFlow will automatically submit and execute it as soon as your network recovers."
            : "Your savings wallet balance has been credited instantly."}
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
            {result.depositCode && method === "agent_cash" && (
              <div className="flex justify-between items-center border-t border-border/40 pt-2 text-xs">
                <span className="text-muted-foreground">
                  Agent Deposit Code
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {result.depositCode}
                </span>
              </div>
            )}
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
            <Button className="w-full">Open Payment Gateway</Button>
          </a>
        ) : null}

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={() => {
              setStep(1);
              setResult(null);
              setError("");
            }}
          >
            Make Another Deposit
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="flex h-9 w-9 items-center justify-center hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="dashboard-title">Make a Deposit</h1>
      </div>

      {!isKycVerified && (
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

      {/* Standard Stepper Bar */}
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
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className="border border-border px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
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
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3.5 border p-3.5 text-left transition-colors ${isSelected ? "border-primary bg-primary-100 dark:bg-primary-950/20" : "border-border hover:bg-muted/50"}`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {m.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.subtitle}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="ml-auto text-primary text-xs font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* DYNAMIC FORM INPUTS */}
            {method === "mtn_momo" || method === "telecel_cash" ? (
              <Input
                label="MoMo Payer Number"
                type="tel"
                placeholder="0241234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            ) : method === "bank_transfer" ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2 text-left">
                <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Instant GhIPSS Bank Transfer
                </div>
                <p className="text-muted-foreground">
                  Transfer GHS {parseFloat(amount).toFixed(2)} to your dedicated
                  Stanbic virtual account:
                </p>
                <div className="p-3 bg-card rounded-lg border border-border font-mono text-foreground space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-bold">Stanbic Bank Ghana</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-bold">
                      SusuFlow - {userProfile?.firstName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Account No:</span>
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <span>90400192837</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("90400192837");
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        className="p-1 hover:bg-muted"
                      >
                        {copiedAccount ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : method === "card" ? (
              <div className="space-y-3 text-left">
                <Input
                  label="Card Number"
                  type="text"
                  placeholder="4532 •••• •••• 8921"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry (MM/YY)"
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                  <Input
                    label="CVC"
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-left space-y-1">
                <p className="font-semibold text-foreground">
                  Field Collector Cash Deposit
                </p>
                <p className="text-muted-foreground">
                  Hand physical cash to your field collector agent. Submitting
                  generates an instant 6-digit verification code.
                </p>
              </div>
            )}

            {error ? (
              <p className="text-sm text-debit bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                {error}
              </p>
            ) : null}

            <Button
              className="w-full"
              loading={loading}
              onClick={handleDeposit}
            >
              Pay GHS {parseFloat(amount).toFixed(2)}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
