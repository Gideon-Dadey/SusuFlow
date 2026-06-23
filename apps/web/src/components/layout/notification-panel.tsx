'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faArrowDown,
  faArrowUp,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import { depositApi, withdrawalApi, type Transaction } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

interface NotificationItem {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  description?: string;
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return faCheckCircle;
    case 'failed':
    case 'rejected':
      return faTimesCircle;
    case 'pending':
    case 'pending_confirmation':
      return faClock;
    default:
      return faSpinner;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return 'text-emerald-500';
    case 'failed':
    case 'rejected':
      return 'text-red-500';
    case 'pending':
    case 'pending_confirmation':
      return 'text-amber-500';
    default:
      return 'text-blue-500';
  }
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency || 'GHS',
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function timeAgo(dateStr: string) {
  try {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return '';
  }
}

export function NotificationPanel() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const roles = user?.roles ?? [];
  const isCustomer = roles.includes('customer') || roles.includes('saver');
  const isStaff = roles.includes('staff') || roles.includes('admin') || roles.includes('org_admin');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const notifications: NotificationItem[] = [];

      // Fetch recent deposits
      try {
        const deposits = await depositApi.list();
        const depositItems = (deposits.items || []).slice(0, 10).map((t: Transaction) => ({
          id: t.id,
          type: 'deposit' as const,
          amount: Number(t.amount),
          currency: t.currency || 'GHS',
          status: t.status,
          createdAt: t.createdAt,
          description: t.description,
        }));
        notifications.push(...depositItems);
      } catch {
        // Silently ignore if deposits endpoint fails
      }

      // Fetch recent withdrawals (staff/admin only)
      if (isStaff) {
        try {
          const withdrawals = await withdrawalApi.list();
          const withdrawalItems = (withdrawals.items || []).slice(0, 10).map((t: Transaction) => ({
            id: t.id,
            type: 'withdrawal' as const,
            amount: Number(t.amount),
            currency: t.currency || 'GHS',
            status: t.status,
            createdAt: t.createdAt,
            description: t.description,
          }));
          notifications.push(...withdrawalItems);
        } catch {
          // Silently ignore if withdrawals endpoint fails
        }
      }

      // Sort by date (newest first)
      notifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setItems(notifications.slice(0, 15));
      setHasLoaded(true);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !hasLoaded) {
      fetchNotifications();
    }
  };

  // Count recent (< 1 hour) pending items
  const recentPending = items.filter((n) => {
    const age = Date.now() - new Date(n.createdAt).getTime();
    return age < 3600000 && ['pending', 'pending_confirmation'].includes(n.status.toLowerCase());
  }).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faBell} className="h-[1.05rem] w-[1.05rem]" />
        {recentPending > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {recentPending > 9 ? '9+' : recentPending}
          </span>
        )}
        {recentPending === 0 && (
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" aria-hidden />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[300] mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {hasLoaded && (
              <button
                type="button"
                onClick={() => fetchNotifications()}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {loading && !hasLoaded ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Loading notifications…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <FontAwesomeIcon icon={faInbox} className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/70">
                  Activity will appear here as it happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    {/* Type icon */}
                    <div
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                        item.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={item.type === 'deposit' ? faArrowDown : faArrowUp}
                        className="h-3.5 w-3.5"
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          <span className="ml-1.5 font-semibold">
                            {formatAmount(item.amount, item.currency)}
                          </span>
                        </p>
                        <FontAwesomeIcon
                          icon={getStatusIcon(item.status)}
                          className={`h-3.5 w-3.5 shrink-0 ${getStatusColor(item.status)}`}
                          title={item.status}
                        />
                      </div>
                      {item.description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
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
            <div className="border-t border-border px-4 py-2.5">
              <p className="text-center text-xs text-muted-foreground">
                Showing {items.length} most recent
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
