"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { customerApi, depositApi, withdrawalApi, Transaction } from "@/lib/api";
import { getInitials, formatGhs, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { CustomerListSkeleton } from "@/components/ui/skeleton";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Tabs: overview, deposit, withdraw
  const [activeTab, setActiveTab] = useState<
    "overview" | "deposit" | "withdraw"
  >("overview");

  // Forms
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [depositMethod, setDepositMethod] = useState("cash");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("cash");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);

  const handleActivate = async () => {
    setActivateLoading(true);
    setFormError("");
    setFormSuccess("");
    try {
      await customerApi.activate(id);
      setFormSuccess("Customer account successfully activated!");
      queryClient.invalidateQueries({ queryKey: ["staff-customer", id] });
      setTimeout(() => setFormSuccess(""), 4000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setActivateLoading(false);
    }
  };

  // Fetch customer details
  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["staff-customer", id],
    queryFn: () => customerApi.get(id),
  });

  // Fetch customer wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["staff-customer-wallet", id],
    queryFn: () => customerApi.getWallet(id),
  });

  // Fetch deposits
  const { data: depositsData } = useQuery({
    queryKey: ["staff-customer-deposits", id],
    queryFn: () => depositApi.list({ customer_id: id }),
  });

  // Fetch withdrawals
  const { data: withdrawalsData } = useQuery({
    queryKey: ["staff-customer-withdrawals", id],
    queryFn: () => withdrawalApi.list({ customer_id: id }),
  });

  // Combine and sort transactions
  const deposits = depositsData?.items || [];
  const withdrawals = withdrawalsData?.items || [];
  const allTransactions = [...deposits, ...withdrawals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: async (vars: {
      amount: number;
      phone: string;
      method: string;
    }) => {
      // 1. Initiate deposit
      const res = await depositApi.initiate({
        amount: vars.amount,
        paymentMethod: vars.method,
        customerId: id,
        payerPhone: vars.phone || customer?.user?.phone || "+233241234567",
        idempotencyKey: `staff_dep_${id}_${Date.now()}`,
      });

      // 2. If dev environment, immediately auto-confirm mock payment to update balance
      // If paymentMethod is cash or momo, we hit the mock confirm webhook
      await fetch(`/api/v1/webhooks/mock/confirm/${res.reference}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: res.reference, amount: vars.amount }),
      }).catch(() => {});

      return res;
    },
    onSuccess: () => {
      setFormSuccess("Deposit successfully recorded and credited!");
      setDepositAmount("");
      setDepositPhone("");
      queryClient.invalidateQueries({
        queryKey: ["staff-customer-wallet", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-customer-deposits", id],
      });
      setTimeout(() => setFormSuccess(""), 4000);
    },
    onError: (err) => {
      setFormError(
        err instanceof Error ? err.message : "Failed to record deposit",
      );
    },
  });

  // Withdrawal Mutation
  const withdrawMutation = useMutation({
    mutationFn: async (vars: {
      amount: number;
      phone: string;
      method: string;
    }) => {
      return withdrawalApi.create({
        customerId: id,
        amount: vars.amount,
        disbursementMethod: vars.method,
        disbursementPhone:
          vars.phone || customer?.user?.phone || "+233241234567",
      });
    },
    onSuccess: () => {
      setFormSuccess("Withdrawal successfully processed and debited!");
      setWithdrawAmount("");
      setWithdrawPhone("");
      queryClient.invalidateQueries({
        queryKey: ["staff-customer-wallet", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-customer-withdrawals", id],
      });
      setTimeout(() => setFormSuccess(""), 4000);
    },
    onError: (err) => {
      setFormError(
        err instanceof Error ? err.message : "Failed to record withdrawal",
      );
    },
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid positive amount.");
      return;
    }
    depositMutation.mutate({
      amount: amt,
      phone: depositPhone,
      method: depositMethod,
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid positive amount.");
      return;
    }
    if (wallet && wallet.balance < amt) {
      setFormError(
        `Insufficient funds. Wallet balance is GHS ${wallet.balance.toFixed(2)}`,
      );
      return;
    }
    withdrawMutation.mutate({
      amount: amt,
      phone: withdrawPhone,
      method: withdrawMethod,
    });
  };

  const handleExportLedgerCsv = () => {
    if (!customer) return;
    const headers = [
      "Date",
      "Reference",
      "Transaction Type",
      "Amount (GHS)",
      "Status",
    ];
    const rows = allTransactions.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.reference,
      t.type,
      t.type === "deposit" ? `+${t.amount}` : `-${t.amount}`,
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `customer_ledger_${customer.customerNumber}_${Date.now()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (customerLoading) {
    return <CustomerListSkeleton count={1} />;
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
        <p>Customer profile not found.</p>
        <Link
          href="/staff/customers"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/staff/customers">
          <button className="flex h-9 w-9 items-center justify-center hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="dashboard-title">Customer Account</h1>
        </div>
      </div>

      {/* Profile summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary font-bold text-xl border border-primary/20">
              {customer.user?.avatarUrl ? (
                <img
                  src={customer.user.avatarUrl}
                  alt={`${customer.user?.firstName || "Customer"} Avatar`}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(customer.user?.firstName, customer.user?.lastName)
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">
                  {customer.user?.firstName || "Pending"}
                  {""}
                  {customer.user?.lastName || "Onboarding"}
                </h2>
                <StatusBadge status={customer.status} />
                {customer.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={handleActivate}
                    loading={activateLoading}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 py-1 px-3 font-semibold"
                  >
                    Approve Account
                  </Button>
                )}
              </div>
              <p className="text-sm font-mono text-muted-foreground">
                {customer.customerNumber}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  {""}
                  <span className="font-medium text-foreground">
                    {customer.user?.phone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  {""}
                  <span className="font-medium text-foreground">
                    {customer.user?.email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">KYC Level:</span>
                  {""}
                  <span className="font-medium text-foreground">
                    Level {customer.kycLevel}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ghana Card:</span>
                  {""}
                  <span className="font-medium text-foreground">
                    {customer.ghanaCardNumber || "Not verified"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="bg-card border border-border/60 shadow-md">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Savings Wallet Balance
              </p>
              <div className="mt-2 text-3xl font-extrabold text-foreground font-mono">
                {walletLoading ? "..." : formatGhs(wallet?.balance || 0)}
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span>Wallet ID</span>
              <span className="font-semibold text-foreground">
                {wallet?.walletId
                  ? `${wallet.walletId.slice(0, 10)}...`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-6">
        {(["overview", "deposit", "withdraw"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setFormError("");
              setFormSuccess("");
            }}
            className={`pb-3 text-sm font-semibold capitalize relative transition-colors ${activeTab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
            {activeTab === t ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            ) : null}
          </button>
        ))}
      </div>

      {/* Form success/error banner */}
      {formError ? (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      ) : null}
      {formSuccess ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {formSuccess}
        </div>
      ) : null}

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <Card className="bg-card border border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Account History
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportLedgerCsv}
              className="text-xs font-semibold"
              disabled={allTransactions.length === 0}
            >
              Download CSV
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {allTransactions.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-sm">
                No transactions on record
              </p>
            ) : (
              allTransactions.map((t) => {
                const isDeposit = t.type === "deposit";
                const amt =
                  typeof t.amount === "string"
                    ? parseFloat(t.amount)
                    : t.amount;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTxn(t);
                      setReceiptOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isDeposit
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground capitalize">
                        {t.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${isDeposit ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {isDeposit ? "+" : "-"}
                        {formatGhs(amt)}
                      </p>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {t.reference}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "deposit" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Record Deposit
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Initiate and credit a payment (Cash or MoMo) directly to this
              wallet.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <Input
                label="Amount (GHS) *"
                type="number"
                min="1"
                placeholder="100.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />

              <div className="space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Payment Mode *
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "cash", label: "Physical Cash" },
                    { id: "mtn_momo", label: "MTN MoMo" },
                    { id: "telecel_cash", label: "Telecel Cash" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDepositMethod(m.id)}
                      className={`py-2.5 px-3 text-xs font-semibold border transition-colors ${depositMethod === m.id ? "border-primary bg-primary-100 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {depositMethod !== "cash" ? (
                <Input
                  label="MoMo Payer Number *"
                  type="tel"
                  placeholder="+233241234567"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  required
                />
              ) : null}

              <Button
                type="submit"
                className="w-full font-semibold"
                loading={depositMutation.isPending}
                disabled={!depositAmount}
              >
                Confirm and Credit Deposit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "withdraw" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Process Withdrawal
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Debit customer savings balance and pay out (via Cash or MoMo).
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <Input
                label="Amount (GHS) *"
                type="number"
                min="1"
                placeholder="50.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />

              <div className="space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Disbursement Method *
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "cash", label: "Cash Out" },
                    { id: "mtn_momo", label: "MTN MoMo" },
                    { id: "telecel_cash", label: "Telecel Cash" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id)}
                      className={`py-2.5 px-3 text-xs font-semibold border transition-colors ${withdrawMethod === m.id ? "border-primary bg-primary-100 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {withdrawMethod !== "cash" ? (
                <Input
                  label="MoMo Payee Number *"
                  type="tel"
                  placeholder="+233241234567"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  required
                />
              ) : null}

              <Button
                type="submit"
                className="w-full font-semibold"
                loading={withdrawMutation.isPending}
                disabled={!withdrawAmount}
              >
                Process and Cash Out
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  );
}
