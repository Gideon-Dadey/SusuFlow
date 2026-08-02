"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faArrowDown,
  faArrowUp,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { depositApi, withdrawalApi, type Transaction } from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface NotificationItem {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  description?: string;
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "confirmed":
      return faCheckCircle;
    case "failed":
    case "rejected":
      return faTimesCircle;
    case "pending":
    case "pending_confirmation":
      return faClock;
    default:
      return faCheckCircle;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
    case "confirmed":
      return "text-emerald-500";
    case "failed":
    case "rejected":
      return "text-red-500";
    case "pending":
    case "pending_confirmation":
      return "text-amber-500";
    default:
      return "text-blue-500";
  }
}

function timeAgo(dateStr: string) {
  try {
    const seconds = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

export function NotificationPanel() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const roles = user?.roles ?? [];
  const isCustomer = roles.includes("customer");
  const isStaff =
    roles.includes("company_admin") ||
    roles.includes("account_officer") ||
    roles.includes("auditor");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notifications: NotificationItem[] = [];

      try {
        const deposits = await depositApi.list();
        const depositItems = (deposits.items || [])
          .slice(0, 10)
          .map((t: Transaction) => ({
            id: t.id,
            type: "deposit" as const,
            amount: Number(t.amount),
            currency: t.currency || "GHS",
            status: t.status,
            createdAt: t.createdAt,
            description: t.description,
          }));
        notifications.push(...depositItems);
      } catch {
        // Silently ignore if deposits fetch fails
      }

      if (isCustomer || isStaff) {
        try {
          const withdrawals = await withdrawalApi.list();
          const withdrawalItems = (withdrawals.items || [])
            .slice(0, 10)
            .map((t: Transaction) => ({
              id: t.id,
              type: "withdrawal" as const,
              amount: Number(t.amount),
              currency: t.currency || "GHS",
              status: t.status,
              createdAt: t.createdAt,
              description: t.description,
            }));
          notifications.push(...withdrawalItems);
        } catch {
          // Silently ignore if withdrawals fetch fails
        }
      }

      notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setItems(notifications.slice(0, 15));
    } catch {
      // Silently catch
    } finally {
      setLoading(false);
    }
  }, [isStaff, isCustomer]);

  // Prefetch notifications immediately on component mount (Instant load)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const recentPending = items.filter((n) => {
    const age = Date.now() - new Date(n.createdAt).getTime();
    return (
      age < 3600000 &&
      ["pending", "pending_confirmation"].includes(n.status.toLowerCase())
    );
  }).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex size-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/60 bg-card"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
        {recentPending > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {recentPending > 9 ? "9+" : recentPending}
          </span>
        ) : (
          <span
            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[300] mt-2 w-80 sm:w-96 overflow-hidden rounded-none border border-border/60 bg-popover shadow-md transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-card">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">
              Notifications
            </h3>
            <button
              type="button"
              onClick={() => fetchNotifications()}
              className="text-xs font-semibold text-secondary hover:underline transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {loading && items.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="size-8 rounded-full bg-muted/60" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-muted/60" />
                      <div className="h-2.5 w-1/2 rounded bg-muted/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center p-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                  <FontAwesomeIcon icon={faInbox} className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  No notifications yet
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Recent activities will appear here automatically
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/20 cursor-pointer"
                  >
                    {/* Type icon */}
                    <div
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                        item.type === "deposit"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={item.type === "deposit" ? faArrowDown : faArrowUp}
                        className="h-3 w-3"
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {item.type === "deposit"
                            ? "Deposit Received"
                            : "Withdrawal Payout"}
                        </p>
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {formatGhs(item.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.description ||
                            `${item.type.toUpperCase()} transaction`}
                        </p>
                        <FontAwesomeIcon
                          icon={getStatusIcon(item.status)}
                          className={`h-3 w-3 shrink-0 ${getStatusColor(item.status)}`}
                          title={item.status}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground font-mono">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border/60 px-4 py-2 bg-card text-center">
              <span className="text-[11px] font-medium text-muted-foreground">
                Showing {items.length} most recent activities
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
