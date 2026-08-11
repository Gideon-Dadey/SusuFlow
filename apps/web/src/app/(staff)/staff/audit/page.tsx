"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown } from "@/components/icons/phosphor";
import { auditApi, type AuditLogEntry } from "@/lib/api";
import { cn, formatDate, formatGhs } from "@/lib/utils";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import { CompanyPanel } from "@/components/company-admin/company-panel";
import { CompanyFilterTabs } from "@/components/company-admin/company-filter-tabs";
import { CompanySearchField } from "@/components/company-admin/company-search-field";
import { CompanyAvatar } from "@/components/company-admin/company-avatar";

const EVENT_COPY: Record<string, { title: string; verb: string }> = {
  "deposit:initiate": {
    title: "Recorded a deposit",
    verb: "started collecting from",
  },
  "deposit:complete": {
    title: "Confirmed a deposit",
    verb: "collected from",
  },
  "withdrawal:record": {
    title: "Recorded a payout",
    verb: "paid out to",
  },
  "withdrawal:request": {
    title: "Requested a payout",
    verb: "asked to pay",
  },
  "withdrawal:approve": {
    title: "Approved a payout",
    verb: "authorized payout to",
  },
  "withdrawal:reject": {
    title: "Declined a payout",
    verb: "blocked payout to",
  },
  "customer:create": {
    title: "Added a customer",
    verb: "onboarded",
  },
  "kyc:submit": {
    title: "Submitted identity documents",
    verb: "sent documents for",
  },
  "kyc:review": {
    title: "Reviewed identity documents",
    verb: "reviewed",
  },
  "kyc:review-bundle": {
    title: "Completed an identity review",
    verb: "reviewed",
  },
  "ledger:commission_payout": {
    title: "Paid a collector commission",
    verb: "paid commission to",
  },
  "user:login": {
    title: "Signed in",
    verb: "accessed the workspace",
  },
  "fraud:resolve": {
    title: "Resolved a risk alert",
    verb: "cleared an alert for",
  },
};

function eventTitle(log: AuditLogEntry) {
  if (log.action === "kyc:review-bundle") {
    const status = (log.afterState as { status?: string } | null)?.status;
    if (status === "approved") return "Approved identity documents";
    if (status === "rejected") return "Declined identity documents";
  }
  return EVENT_COPY[log.action]?.title || log.action.replace(/[:_]/g, " ");
}

function eventVerb(log: AuditLogEntry) {
  return EVENT_COPY[log.action]?.verb || "acted on";
}

function actorParts(log: AuditLogEntry) {
  if (log.actor?.name) {
    const [firstName = "", ...rest] = log.actor.name.split(" ");
    return { firstName, lastName: rest.join(" "), name: log.actor.name };
  }
  if (log.user) {
    return {
      firstName: log.user.firstName,
      lastName: log.user.lastName,
      name: `${log.user.firstName} ${log.user.lastName}`.trim(),
    };
  }
  return { firstName: "System", lastName: "", name: "System" };
}

export default function AuditLogsPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-none bg-muted/60" />}
    >
      <AuditLogsContent />
    </Suspense>
  );
}

function AuditLogsContent() {
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get("userId") || "";
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["staff-audit-logs", category, query, userIdFilter],
      initialPageParam: undefined as string | undefined,
      queryFn: ({ pageParam }) =>
        auditApi.list({
          category: category || undefined,
          q: query || undefined,
          userId: userIdFilter || undefined,
          cursor: pageParam,
          limit: 40,
        }),
      getNextPageParam: (last) => (last.hasMore ? last.cursor : undefined),
    });

  const logs = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const summary = data?.pages[0]?.summary;

  const handleExport = () => {
    const headers = [
      "When",
      "Actor",
      "Role",
      "Email",
      "Event",
      "Customer",
      "Amount",
      "Reference",
      "IP",
      "Action code",
    ];
    const rows = logs.map((log) => {
      const actor = actorParts(log);
      return [
        new Date(log.createdAt).toISOString(),
        `"${actor.name}"`,
        log.actor?.roleLabel || "",
        log.actor?.email || log.user?.email || "",
        `"${eventTitle(log)}"`,
        `"${log.subject?.name || ""}"`,
        log.money?.amount ?? "",
        log.money?.reference || "",
        log.ipAddress || "",
        log.action,
      ];
    });
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `audit_trail_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      <CompanyPageHeader
        actions={
          <button
            type="button"
            onClick={handleExport}
            disabled={!logs.length}
            className="company-cta-secondary disabled:opacity-50"
          >
            Export
          </button>
        }
      />

      <CompanyFilterTabs
        value={category}
        onChange={setCategory}
        tabs={[
          { label: "All activity", value: "", count: summary?.all },
          { label: "Money", value: "money", count: summary?.money },
          { label: "Customers", value: "customers", count: summary?.customers },
          { label: "Identity", value: "identity", count: summary?.identity },
          { label: "Access", value: "access", count: summary?.access },
          { label: "Risk", value: "risk", count: summary?.risk },
        ]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CompanySearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by staff name, customer, or event"
          className="sm:max-w-sm"
        />
        {userIdFilter ? (
          <p className="text-xs text-muted-foreground">
            Showing one staff member’s trail
          </p>
        ) : null}
      </div>

      <CompanyPanel>
        {isLoading ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            Loading activity…
          </p>
        ) : logs.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No activity matches these filters.
          </p>
        ) : (
          <div className="company-trail">
            <div className="company-trail-head">
              <span>Actor</span>
              <span>Event</span>
              <span>Customer</span>
              <span>Amount</span>
              <span>When</span>
            </div>
            {logs.map((log) => (
              <AuditRow
                key={log.id}
                log={log}
                open={openId === log.id}
                onToggle={() =>
                  setOpenId((current) => (current === log.id ? null : log.id))
                }
              />
            ))}
          </div>
        )}
        {hasNextPage ? (
          <div className="company-trail-more">
            <button
              type="button"
              className="company-cta-secondary"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading…" : "Load earlier activity"}
            </button>
          </div>
        ) : null}
      </CompanyPanel>
    </div>
  );
}

function AuditRow({
  log,
  open,
  onToggle,
}: {
  log: AuditLogEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const actor = actorParts(log);
  const after = (log.afterState ?? {}) as Record<string, unknown>;

  return (
    <div className={cn("company-trail-item", open && "is-open")}>
      <button type="button" className="company-trail-row" onClick={onToggle}>
        <div className="company-trail-actor">
          <CompanyAvatar
            firstName={actor.firstName}
            lastName={actor.lastName}
            seed={log.actor?.id || actor.name}
            className="size-8 text-[11px]"
          />
          <div className="min-w-0">
            <p className="company-trail-name">{actor.name}</p>
            <p className="company-trail-meta">
              {log.actor?.roleLabel || "Staff"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <p className="company-trail-event">{eventTitle(log)}</p>
          <p className="company-trail-meta">
            {eventVerb(log)}
            {log.subject?.name ? ` ${log.subject.name}` : ""}
          </p>
        </div>

        <div className="min-w-0">
          {log.subject ? (
            <>
              <p className="company-trail-name">{log.subject.name}</p>
              {log.subject.secondary ? (
                <p className="company-trail-meta font-mono">
                  {log.subject.secondary}
                </p>
              ) : null}
            </>
          ) : (
            <p className="company-trail-meta">—</p>
          )}
        </div>

        <div className="company-trail-money">
          {log.money?.amount != null ? (
            <>
              <p>{formatGhs(log.money.amount)}</p>
              {log.money.reference ? <span>{log.money.reference}</span> : null}
            </>
          ) : (
            <p className="company-trail-meta">—</p>
          )}
        </div>

        <div className="company-trail-when">
          <p>{formatDate(log.createdAt)}</p>
          <ChevronDown
            className={cn("company-trail-chevron", open && "is-open")}
          />
        </div>
      </button>

      {open ? (
        <dl className="company-trail-detail">
          <div>
            <dt>Actor</dt>
            <dd>
              {actor.name}
              {log.actor?.email ? ` · ${log.actor.email}` : ""}
            </dd>
          </div>
          <div>
            <dt>Event code</dt>
            <dd>{log.action}</dd>
          </div>
          {log.money?.reference ? (
            <div>
              <dt>Reference</dt>
              <dd>{log.money.reference}</dd>
            </div>
          ) : null}
          <div>
            <dt>Source IP</dt>
            <dd>{log.ipAddress || "Not captured"}</dd>
          </div>
          <div>
            <dt>Device</dt>
            <dd className="truncate">
              {log.userAgent || log.deviceId || "Not captured"}
            </dd>
          </div>
          {typeof after.rejectionReason === "string" ? (
            <div>
              <dt>Reason</dt>
              <dd>{after.rejectionReason}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}
