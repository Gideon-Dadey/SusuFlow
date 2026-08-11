"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/badge";
import {
  operationsApi,
  type ActionQueueItem,
  type QueueItemType,
} from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ClipboardList,
  ShieldAlert,
  UserCheck,
  UserPlus,
} from "@/components/icons/phosphor";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import {
  CompanyPanel,
  CompanyPanelHeader,
} from "@/components/company-admin/company-panel";

const QUEUE_LINKS: Record<QueueItemType, string> = {
  withdrawal: "/staff/withdrawals",
  deposit: "/staff/deposits",
  kyc: "/staff/kyc",
  fraud: "/staff/fraud",
  customer: "/staff/customers",
};

const QUEUE_ICONS: Record<QueueItemType, typeof ArrowDown> = {
  withdrawal: ArrowUp,
  deposit: ArrowDown,
  kyc: UserCheck,
  fraud: ShieldAlert,
  customer: UserPlus,
};

const PRIORITY_STYLES = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-sky-500",
};

function QueueRow({ item }: { item: ActionQueueItem }) {
  const href = QUEUE_LINKS[item.type];

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 border-l-4 ${PRIORITY_STYLES[item.priority]} px-4 py-3.5 hover:bg-muted/40 transition-colors`}
    >
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef3f8] dark:bg-white/5">
        {(() => {
          const Icon = QUEUE_ICONS[item.type] || ClipboardList;
          return (
            <Icon className="h-4 w-4 text-muted-foreground" weight="regular" />
          );
        })()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {item.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {item.subtitle}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          {item.amount != null && (
            <span className="font-semibold text-foreground">
              {formatGhs(item.amount)}
            </span>
          )}
          <span>{new Date(item.createdAt).toLocaleString()}</span>
          <span className="capitalize">{item.priority} priority</span>
        </div>
      </div>
    </Link>
  );
}

export default function ActionQueuePage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["staff-action-queue"],
    queryFn: () => operationsApi.getQueue(),
    refetchInterval: 60_000,
  });

  const summary = data?.summary;
  const items = data?.items ?? [];

  const summaryCards = [
    {
      label: "Withdrawals",
      count: summary?.pendingWithdrawals ?? 0,
      href: "/staff/withdrawals",
    },
    {
      label: "Deposits",
      count: summary?.pendingDeposits ?? 0,
      href: "/staff/deposits",
    },
    {
      label: "KYC Reviews",
      count: summary?.pendingKyc ?? 0,
      href: "/staff/kyc",
    },
    {
      label: "Fraud Alerts",
      count: summary?.openFraud ?? 0,
      href: "/staff/fraud",
    },
    {
      label: "New Customers",
      count: summary?.pendingCustomers ?? 0,
      href: "/staff/customers?status=pending",
    },
  ];

  return (
    <div className="space-y-5">
      <CompanyPageHeader
        title="Approvals"
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="company-cta-secondary disabled:opacity-50"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((card) => (
          <Link key={card.label} href={card.href} className="company-panel p-4">
            <p className="company-meta uppercase tracking-[0.06em]">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {card.count}
            </p>
          </Link>
        ))}
        <div className="company-panel p-4">
          <p className="company-meta uppercase tracking-[0.06em]">
            Total pending
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {summary?.total ?? 0}
          </p>
        </div>
      </div>

      <CompanyPanel>
        <CompanyPanelHeader title="Pending actions" />
        {isLoading ? (
          <div className="h-48 animate-pulse bg-muted/50 m-4 rounded-lg" />
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-foreground">All caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No pending withdrawals, deposits, KYC reviews, or fraud alerts
            </p>
          </div>
        ) : (
          <div>
            {items.map((item) => (
              <QueueRow key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </CompanyPanel>
    </div>
  );
}
