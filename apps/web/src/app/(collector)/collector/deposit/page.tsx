"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyDisplay } from "@/components/financial/money-display";
import { customerApi, depositApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Search,
  UserPlus,
  Smartphone,
  ShieldCheck,
  Users,
  Wallet,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];
const PAYMENT_METHODS = [
  {
    id: "mtn_momo",
    label: "MTN Mobile Money",
    short: "MTN MoMo",
    accent: "border-yellow-500/40 bg-yellow-500/10",
    dot: "bg-yellow-500",
  },
  {
    id: "telecel_cash",
    label: "Telecel Cash",
    short: "Telecel",
    accent: "border-red-500/40 bg-red-500/10",
    dot: "bg-red-500",
  },
] as const;

const STEPS = [
  { id: 1, label: "Customer" },
  { id: 2, label: "Amount & MoMo" },
  { id: 3, label: "Confirm" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex flex-1 items-center min-w-0">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
              current > s.id && "bg-emerald-500 text-white",
              current === s.id &&
                "bg-primary text-primary-foreground ring-4 ring-primary/20",
              current < s.id && "bg-muted text-muted-foreground",
            )}
          >
            {current > s.id ? <Check className="h-4 w-4" /> : s.id}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-1 rounded-full",
                current > s.id ? "bg-emerald-500" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CollectorDepositForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomer = searchParams.get("customer");

  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState(preselectedCustomer || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    paymentUrl?: string;
  } | null>(null);

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["collector-customers-select"],
    queryFn: () => customerApi.list({ status: "active" }),
  });

  const customers = customersData?.items || [];
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const name =
        `${c.user?.firstName || ""} ${c.user?.lastName || ""}`.toLowerCase();
      const phoneStr = (c.user?.phone || "").toLowerCase();
      const num = (c.customerNumber || "").toLowerCase();
      return name.includes(q) || phoneStr.includes(q) || num.includes(q);
    });
  }, [customers, customerSearch]);

  useEffect(() => {
    if (selectedCustomer?.user?.phone && !phone) {
      setPhone(selectedCustomer.user.phone);
    }
  }, [selectedCustomer, phone]);

  useEffect(() => {
    if (preselectedCustomer) {
      setCustomerId(preselectedCustomer);
      setStep(2);
    }
  }, [preselectedCustomer]);

  const handleCopyRef = async () => {
    if (!result?.reference) return;
    await navigator.clipboard.writeText(result.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await depositApi.initiate({
        amount: parseFloat(amount),
        paymentMethod: method,
        customerId,
        payerPhone: phone,
        idempotencyKey: `col_dep_${Date.now()}`,
      });
      setResult({
        reference: res.reference,
        paymentUrl: res.payment.paymentUrl,
      });
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate collection",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/collector/dashboard"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="dashboard-title">Collect</h1>
      </div>

      {step < 3 && <StepIndicator current={step} />}

      <div className={cn("grid gap-6", step === 2 && "lg:grid-cols-3")}>
        {/* Main panel */}
        <div className={cn(step === 2 && "lg:col-span-2")}>
          {step === 1 && (
            <Card className="portal-card overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base font-bold">
                    Select customer
                  </CardTitle>
                  <Link href="/collector/customers">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 shrink-0"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Add new
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, or customer ID…"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>

                {customersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-16 animate-pulse rounded-xl bg-muted/60"
                      />
                    ))}
                  </div>
                ) : customers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 px-6 py-12 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                      <Users className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No customers yet
                    </p>
                    <Link
                      href="/collector/customers"
                      className="inline-block mt-5"
                    >
                      <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Onboard customer
                      </Button>
                    </Link>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No customers match &ldquo;{customerSearch}&rdquo;
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[min(420px,50vh)] overflow-y-auto pr-0.5">
                    {filteredCustomers.map((c) => {
                      const selected = customerId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCustomerId(c.id);
                            setStep(2);
                            setError("");
                          }}
                          className={cn(
                            "group w-full flex items-center gap-3 border p-3.5 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                              : "border-border/60 hover:border-primary/30 hover:bg-muted/30",
                          )}
                        >
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {getInitials(c.user?.firstName, c.user?.lastName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {c.user?.firstName} {c.user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {c.customerNumber}
                            </p>
                            {c.user?.phone && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {c.user.phone}
                              </p>
                            )}
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                              "group-hover:translate-x-0.5 group-hover:text-primary",
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="portal-card border-border/60 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex items-center gap-3">
                  {selectedCustomer && (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                      {getInitials(
                        selectedCustomer.user?.firstName,
                        selectedCustomer.user?.lastName,
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-base font-bold truncate">
                      {selectedCustomer
                        ? `${selectedCustomer.user?.firstName} ${selectedCustomer.user?.lastName}`
                        : "Collection details"}
                    </CardTitle>
                    {selectedCustomer && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {selectedCustomer.customerNumber}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-6">
                {/* Amount */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Amount (GHS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      GHS
                    </span>
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-14 pl-12 text-2xl font-bold tracking-tight"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAmount(String(a))}
                        className={cn(
                          "border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                          amount === String(a)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50 hover:text-primary",
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Payment method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={cn(
                          "flex items-center gap-3 border p-4 text-left transition-all",
                          method === m.id
                            ? cn(
                                m.accent,
                                "ring-2 ring-offset-2 ring-offset-background ring-primary/30",
                              )
                            : "border-border/60 hover:border-border",
                        )}
                      >
                        <div
                          className={cn(
                            "size-2.5 rounded-full shrink-0",
                            m.dot,
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{m.short}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {m.label}
                          </p>
                        </div>
                        {method === m.id && (
                          <CheckCircle2 className="h-4 w-4 ml-auto text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    MoMo number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 000 0000"
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                  {!preselectedCustomer && (
                    <Button
                      variant="outline"
                      className="sm:w-auto"
                      onClick={() => setStep(1)}
                    >
                      Change customer
                    </Button>
                  )}
                  <Button
                    className="flex-1 h-11 gap-2 text-base font-semibold"
                    disabled={
                      loading || !amount || parseFloat(amount) < 1 || !phone
                    }
                    onClick={handleDeposit}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending prompt…
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        Send MoMo request
                        {amount ? ` · GHS ${amount}` : ""}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && result && (
            <Card className="portal-card border-emerald-500/30 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent px-6 pt-8 pb-6 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-4">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Payment initiated
                </h2>
                <div className="mt-5">
                  <MoneyDisplay
                    amount={parseFloat(amount)}
                    size="xl"
                    className="justify-center"
                  />
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/60 text-sm">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium text-foreground">
                      {selectedCustomer?.user?.firstName}{" "}
                      {selectedCustomer?.user?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-medium">{selectedMethod?.short}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 gap-3">
                    <span className="text-muted-foreground shrink-0">
                      Reference
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-semibold truncate">
                        {result.reference}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRef}
                        className="shrink-0 flex size-7 items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Copy reference"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {result.paymentUrl && (
                  <a
                    href={result.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full h-11">
                      Open payment page
                    </Button>
                  </a>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    className="h-11"
                    onClick={() => router.push("/collector/deposits")}
                  >
                    View history
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => {
                      setStep(preselectedCustomer ? 2 : 1);
                      setAmount("");
                      setResult(null);
                      setError("");
                    }}
                  >
                    Collect again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — step 2 summary + trust */}
        {step === 2 && (
          <div className="lg:col-span-1">
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm sticky top-4">
              <CardContent className="pt-5 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">
                    {amount ? (
                      <MoneyDisplay amount={parseFloat(amount)} size="sm" />
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">
                    {selectedMethod?.short || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">
                    MoMo number
                  </span>
                  <span className="font-mono text-xs text-right truncate">
                    {phone || "—"}
                  </span>
                </div>
                <div className="border-t border-border/60 pt-4">
                  <div className="flex gap-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Funds are only credited after the gateway confirms
                      payment. You cannot manually mark deposits as paid.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectorDepositPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading collection form…
          </p>
        </div>
      }
    >
      <CollectorDepositForm />
    </Suspense>
  );
}
