"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BalanceCard } from "@/components/financial/balance-card";
import { TransactionRow } from "@/components/financial/transaction-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  depositApi,
  customerApi,
  withdrawalApi,
  Transaction,
  userApi,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useOfflineSync } from "@/components/offline-sync-provider";
import { TransactionListSkeleton } from "@/components/ui/skeleton";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import Link from "next/link";
import {
  Wallet,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Target,
} from "lucide-react";

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { queuedDeposits } = useOfflineSync();

  // Query current user's profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
    placeholderData: (prev) => prev,
  });

  const activeCustomer = userProfile?.customer;

  // Parallel Query 1: Wallet Balance
  const { data: walletData } = useQuery({
    queryKey: ["customer-wallet", activeCustomer?.id],
    queryFn: () =>
      activeCustomer
        ? customerApi.getWallet(activeCustomer.id)
        : Promise.resolve(null),
    placeholderData: (prev) => prev,
  });

  // Parallel Query 2: Customer Deposits
  const { data: depositsData, isLoading: depositsLoading } = useQuery({
    queryKey: ["deposits", activeCustomer?.id],
    queryFn: () => depositApi.list({ customer_id: activeCustomer?.id }),
    placeholderData: (prev) => prev,
  });

  // Parallel Query 3: Customer Withdrawals
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["withdrawals", activeCustomer?.id],
    queryFn: () => withdrawalApi.list({ customer_id: activeCustomer?.id }),
    placeholderData: (prev) => prev,
  });

  const isLoading = depositsLoading || withdrawalsLoading;

  const balance = walletData?.balance || 0;

  const mappedQueued: Transaction[] = queuedDeposits.map((q) => ({
    id: q.id,
    reference: q.reference,
    type: "deposit",
    status: q.status,
    amount: q.amount,
    currency: "GHS",
    createdAt: q.createdAt,
    description: `Deposit via ${q.paymentMethod} (Queued Offline)`,
    customer: {
      customerNumber: "Offline",
      user: {
        firstName: q.customerName.split(" ")[0] || "Customer",
        lastName: q.customerName.split(" ").slice(1).join(" ") || "",
      },
    },
    payment: {
      paymentMethod: q.paymentMethod,
      status: q.status === "syncing" ? "pending" : "initiated",
    },
  }));

  const transactions = [
    ...mappedQueued,
    ...(depositsData?.items || []),
    ...(withdrawalsData?.items || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const todayTotal = transactions
    .filter(
      (t) =>
        t.type === "deposit" &&
        t.status === "completed" &&
        new Date(t.createdAt).toDateString() === new Date().toDateString(),
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const isKycVerified =
    activeCustomer?.kycStatus === "verified" ||
    activeCustomer?.kycStatus === "approved" ||
    (typeof activeCustomer?.kycLevel === "number" &&
      activeCustomer.kycLevel >= 2) ||
    Boolean(activeCustomer?.ghanaCardNumber);

  return (
    <div className="space-y-6">
      {/* KYC Verification Banner (Only shown if unverified) */}
      {!isKycVerified && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🛡️</span>
            <div>
              <div className="font-bold text-foreground text-sm flex items-center gap-2">
                Identity Verification Required (Ghana Card / Passport)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload your Ghana Card or Passport to comply with Bank of Ghana
                anti-fraud regulations.
              </p>
            </div>
          </div>
          <Link href="/kyc" className="shrink-0">
            <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              Verify Identity Now →
            </button>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="dashboard-title text-foreground">{user?.firstName}</h2>
          {isKycVerified && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0066cc]/10 text-[#0066cc] dark:text-[#38bdf8] border border-[#0066cc]/20 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified Account
            </span>
          )}
        </div>
      </div>

      <BalanceCard balance={balance} todayChange={todayTotal} />

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            href: "/deposit",
            label: "Deposit",
            icon: Wallet,
            color: "bg-[#0066cc]/10 text-[#0066cc]",
          },
          {
            href: "/withdraw",
            label: "Withdraw",
            icon: ArrowUpRight,
            color: "bg-red-50 text-red-600 dark:bg-red-950/20",
          },
          {
            href: "/plans",
            label: "Goals",
            icon: Target,
            color: "bg-sky-50 text-sky-600 dark:bg-sky-950/20",
          },
          {
            href: "/transactions",
            label: "History",
            icon: FileText,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-950/20",
          },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-secondary/40"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link
            href="/transactions"
            className="text-sm text-primary flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TransactionListSkeleton count={3} />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No transactions yet
              </p>
              <Link
                href="/deposit"
                className="text-primary text-sm font-medium mt-2 inline-block"
              >
                Make your first deposit →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {transactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTxn(t);
                    setReceiptOpen(true);
                  }}
                  className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg px-2"
                >
                  <TransactionRow transaction={t} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedTxn(null);
        }}
      />
    </div>
  );
}
