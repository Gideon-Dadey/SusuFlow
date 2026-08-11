"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CompanyPanel,
  CompanyPanelHeader,
} from "@/components/company-admin/company-panel";
import { CollectionTrendChart } from "@/components/dashboard/collection-trend-chart";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { StatusBadge } from "@/components/ui/badge";
import {
  depositApi,
  customerApi,
  operationsApi,
  withdrawalApi,
} from "@/lib/api";
import { formatDate, formatGhs } from "@/lib/utils";
import { CompanyAvatar } from "@/components/company-admin/company-avatar";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ListFilter,
  ShieldAlert,
  UserPlus,
  Users,
  Wallet,
} from "@/components/icons/phosphor";

export default function StaffDashboard() {
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [actionTab, setActionTab] = useState<"collect" | "onboard">("collect");

  const { data: deposits } = useQuery({
    queryKey: ["staff-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const { data: activeCustomers } = useQuery({
    queryKey: ["staff-active-customers"],
    queryFn: () => customerApi.list({ status: "active" }),
    placeholderData: (prev) => prev,
  });

  const { data: allCustomers } = useQuery({
    queryKey: ["staff-all-customers"],
    queryFn: () => customerApi.list(),
    placeholderData: (prev) => prev,
  });

  const { data: queue } = useQuery({
    queryKey: ["staff-action-queue"],
    queryFn: () => operationsApi.getQueue(),
    placeholderData: (prev) => prev,
    refetchInterval: 60_000,
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["staff-withdrawals"],
    queryFn: () => withdrawalApi.list(),
    placeholderData: (prev) => prev,
  });

  const transactions = deposits?.items || [];
  const recentCustomers = allCustomers?.items || [];
  const queueItems = queue?.items || [];
  const summary = queue?.summary;

  const todayDeposits = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.status === "completed" &&
          new Date(t.createdAt).toDateString() === new Date().toDateString(),
      ),
    [transactions],
  );
  const todayTotal = todayDeposits.reduce((s, t) => s + Number(t.amount), 0);
  const completedVolume = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const pendingActionsCount = summary?.total ?? 0;

  const bookRows = [
    {
      label: "Active customers",
      detail: `${allCustomers?.items?.length || 0} registered`,
      value: String(activeCustomers?.items?.length || 0),
      icon: Users,
      well: "company-well-sky",
    },
    {
      label: "Today’s deposits",
      detail: `${todayDeposits.length} completed`,
      value: formatGhs(todayTotal),
      icon: Wallet,
      well: "company-well-mint",
    },
    {
      label: "Pending KYC",
      detail: "Identity reviews",
      value: String(summary?.pendingKyc ?? 0),
      icon: ClipboardList,
      well: "company-well-amber",
    },
    {
      label: "Pending withdrawals",
      detail: "Awaiting payout",
      value: String(summary?.pendingWithdrawals ?? 0),
      icon: ArrowUpRight,
      well: "company-well-rose",
    },
  ];

  const todoRows = [
    {
      label: "Open approvals",
      detail: "Needs a decision",
      value: pendingActionsCount,
      href: "/staff/queue",
      icon: ClipboardList,
      well: "company-well-violet",
    },
    {
      label: "Deposits to verify",
      detail: "Waiting on confirmation",
      value: summary?.pendingDeposits ?? 0,
      href: "/staff/deposits",
      icon: Wallet,
      well: "company-well-mint",
    },
    {
      label: "New customers",
      detail: "Pending activation",
      value: summary?.pendingCustomers ?? 0,
      href: "/staff/customers?status=pending",
      icon: UserPlus,
      well: "company-well-sky",
    },
    {
      label: "Fraud alerts",
      detail: "Open risk cases",
      value: summary?.openFraud ?? 0,
      href: "/staff/fraud",
      icon: ShieldAlert,
      well: "company-well-rose",
    },
  ];

  const collectRows = [
    {
      label: "Record a deposit",
      detail: "MoMo or bank transfer",
      value: "Start",
      href: "/staff/deposits",
      icon: Wallet,
      well: "company-well-mint",
    },
    {
      label: "Verify receipts",
      detail: "Waiting on confirmation",
      value: String(summary?.pendingDeposits ?? 0),
      href: "/staff/deposits",
      icon: ClipboardList,
      well: "company-well-amber",
    },
    {
      label: "Collected today",
      detail: `${todayDeposits.length} completed`,
      value: formatGhs(todayTotal),
      href: "/staff/deposits",
      icon: ArrowUpRight,
      well: "company-well-sky",
    },
    {
      label: "All deposits",
      detail: "Collection history",
      value: String(transactions.length),
      href: "/staff/deposits",
      icon: Wallet,
      well: "company-well-violet",
    },
  ];

  const onboardRows = [
    {
      label: "Add a customer",
      detail: "Create an account",
      value: "Start",
      href: "/staff/customers/new",
      icon: UserPlus,
      well: "company-well-sky",
    },
    {
      label: "Pending activation",
      detail: "New accounts to review",
      value: String(summary?.pendingCustomers ?? 0),
      href: "/staff/customers?status=pending",
      icon: Users,
      well: "company-well-amber",
    },
    {
      label: "Identity reviews",
      detail: "KYC waiting on staff",
      value: String(summary?.pendingKyc ?? 0),
      href: "/staff/kyc",
      icon: ClipboardList,
      well: "company-well-violet",
    },
    {
      label: "All members",
      detail: "Customer directory",
      value: String(allCustomers?.items?.length || 0),
      href: "/staff/customers",
      icon: Users,
      well: "company-well-mint",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="company-overview-hero">
        <div>
          <p className="company-hero-figure">{formatGhs(completedVolume)}</p>
          <p className="company-meta mt-1">
            {formatGhs(todayTotal)} collected today · {todayDeposits.length}{" "}
            deposits
          </p>
        </div>
        <div className="company-cta-bar">
          <Link
            href="/staff/reports"
            aria-label="Filter reports"
            className="company-cta-icon"
          >
            <ListFilter className="h-4 w-4" weight="regular" />
          </Link>
          <Link href="/staff/customers/new" className="company-cta-secondary">
            Add customer
          </Link>
          <Link href="/staff/deposits" className="company-cta-primary">
            Record deposit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <CompanyPanel className="xl:col-span-4">
          <div className="company-filter-tabs px-[1.1rem]">
            <button
              type="button"
              className={`company-filter-tab ${actionTab === "collect" ? "is-active" : ""}`}
              onClick={() => setActionTab("collect")}
            >
              Collect
            </button>
            <button
              type="button"
              className={`company-filter-tab ${actionTab === "onboard" ? "is-active" : ""}`}
              onClick={() => setActionTab("onboard")}
            >
              Onboard
            </button>
          </div>
          <div>
            {(actionTab === "collect" ? collectRows : onboardRows).map(
              (row) => {
                const Icon = row.icon;
                return (
                  <Link key={row.label} href={row.href} className="company-row">
                    <span className={`company-well ${row.well}`}>
                      <Icon className="h-3.5 w-3.5" weight="regular" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {row.label}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {row.detail}
                      </p>
                    </div>
                    {row.value === "Start" ? (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        weight="regular"
                      />
                    ) : (
                      <p className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                        {row.value}
                      </p>
                    )}
                  </Link>
                );
              },
            )}
          </div>
        </CompanyPanel>

        <CompanyPanel className="xl:col-span-4">
          <CompanyPanelHeader
            title="Your books"
            action={
              <Link href="/staff/ledger" className="company-link">
                Ledger
              </Link>
            }
          />
          <div>
            {bookRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="company-row">
                  <span className={`company-well ${row.well}`}>
                    <Icon className="h-3.5 w-3.5" weight="regular" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {row.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {row.detail}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                    {row.value}
                  </p>
                </div>
              );
            })}
          </div>
        </CompanyPanel>

        <CompanyPanel className="xl:col-span-4">
          <CompanyPanelHeader
            title="To do"
            action={
              <Link href="/staff/queue" className="company-link">
                Approvals
              </Link>
            }
          />
          <div>
            {todoRows.map((row) => {
              const Icon = row.icon;
              return (
                <Link key={row.label} href={row.href} className="company-row">
                  <span className={`company-well ${row.well}`}>
                    <Icon className="h-3.5 w-3.5" weight="regular" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {row.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {row.detail}
                    </p>
                  </div>
                  <span
                    className={`company-count ${Number(row.value) > 0 ? "is-live" : ""}`}
                  >
                    {row.value}
                  </span>
                </Link>
              );
            })}
          </div>
        </CompanyPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <CompanyPanel className="xl:col-span-8">
          <CompanyPanelHeader
            title="Recent activity"
            action={
              <Link href="/staff/deposits" className="company-link">
                View all
              </Link>
            }
          />
          {transactions.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
              No deposit activity yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="text-[11px] font-medium text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Transaction</th>
                    <th className="px-4 py-2.5 font-medium">Amount</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 8).map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        setSelectedTxn(tx);
                        setReceiptOpen(true);
                      }}
                      className="cursor-pointer border-t border-[var(--company-line)] hover:bg-[#fafbfc] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 align-top">
                        <p className="text-[12px] font-medium text-foreground">
                          {formatDate(tx.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <CompanyAvatar
                            firstName={tx.customer?.user?.firstName}
                            lastName={tx.customer?.user?.lastName}
                            seed={tx.customer?.id || tx.reference}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-foreground">
                              {tx.customer?.user
                                ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                                : "Susu member"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {tx.reference} ·{" "}
                              {tx.customer?.customerNumber || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-[13px] font-semibold tabular-nums text-foreground">
                        {formatGhs(tx.amount)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CompanyPanel>

        <CompanyPanel className="xl:col-span-4">
          <CompanyPanelHeader
            title="Approvals"
            action={
              <Link href="/staff/queue" className="company-link">
                Full queue
              </Link>
            }
          />
          {queueItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-xs text-muted-foreground">
                No pending approvals. Collections are up to date.
              </p>
            </div>
          ) : (
            queueItems.slice(0, 6).map((item: any) => (
              <div key={item.id} className="company-row">
                <span className="company-well company-well-amber">
                  <ClipboardList className="h-3.5 w-3.5" weight="regular" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold capitalize text-foreground">
                    {String(item.type || item.title || "").replace(/_/g, " ")}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.description || item.subtitle || "Needs review"}
                  </p>
                </div>
                <Link
                  href="/staff/queue"
                  className="company-btn company-btn-secondary h-8 px-2.5 text-[11px]"
                >
                  Review
                </Link>
              </div>
            ))
          )}
        </CompanyPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <CollectionTrendChart
            transactions={[...transactions, ...(withdrawals?.items || [])]}
          />
        </div>
        <CompanyPanel className="xl:col-span-4">
          <CompanyPanelHeader
            title="Recent members"
            action={
              <Link href="/staff/customers" className="company-link">
                All members
              </Link>
            }
          />
          {recentCustomers.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
              No members registered yet.
            </p>
          ) : (
            recentCustomers.slice(0, 6).map((customer) => (
              <Link
                key={customer.id}
                href={`/staff/customers/${customer.id}`}
                className="company-row"
              >
                <CompanyAvatar
                  firstName={customer.user?.firstName}
                  lastName={customer.user?.lastName}
                  src={customer.user?.avatarUrl}
                  seed={customer.id}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {customer.user?.firstName} {customer.user?.lastName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {customer.customerNumber}
                  </p>
                </div>
                <StatusBadge status={customer.status} />
              </Link>
            ))
          )}
        </CompanyPanel>
      </div>

      {receiptOpen && selectedTxn ? (
        <ReceiptModal
          open={receiptOpen}
          transaction={selectedTxn}
          onClose={() => {
            setReceiptOpen(false);
            setSelectedTxn(null);
          }}
        />
      ) : null}
    </div>
  );
}
