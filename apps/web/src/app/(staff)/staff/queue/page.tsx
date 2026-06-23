"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  operationsApi,
  type ActionQueueItem,
  type QueueItemType,
} from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faUserCheck,
  faTriangleExclamation,
  faUserPlus,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const QUEUE_LINKS: Record<QueueItemType, string> = {
  withdrawal: "/staff/withdrawals",
  deposit: "/staff/deposits",
  kyc: "/staff/kyc",
  fraud: "/staff/fraud",
  customer: "/staff/customers",
};

const QUEUE_ICONS: Record<QueueItemType, typeof faArrowDown> = {
  withdrawal: faArrowUp,
  deposit: faArrowDown,
  kyc: faUserCheck,
  fraud: faTriangleExclamation,
  customer: faUserPlus,
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
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <FontAwesomeIcon
          icon={QUEUE_ICONS[item.type]}
          className="h-4 w-4 text-muted-foreground"
        />
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title">Action Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All pending approvals and reviews in one place
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:border-primary/40 transition-colors h-full">
              <CardContent className="pt-4 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Total Pending
            </p>
            <p className="text-2xl font-bold mt-1 text-primary">
              {summary?.total ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FontAwesomeIcon
              icon={faClipboardList}
              className="h-4 w-4 text-primary"
            />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted/50 m-4 rounded-lg" />
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                All caught up
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No pending withdrawals, deposits, KYC reviews, or fraud alerts
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <QueueRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
