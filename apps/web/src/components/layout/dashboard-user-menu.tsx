'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationPanel } from './notification-panel';
import { getRoleLabel } from '@/lib/dashboard-nav';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials, getProfilePath } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';



export function DashboardUserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/login');
  };

  const roles = user?.roles ?? [];
  const roleLabel = getRoleLabel(roles);

  return (
    <div ref={rootRef} className="flex items-center gap-1 sm:gap-2">
      <ThemeToggle iconOnly />

      <NotificationPanel />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-100 to-rose-200 ring-2 ring-background transition-shadow hover:shadow-md dark:from-rose-900/40 dark:to-rose-800/30"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="text-xs font-bold text-rose-700 dark:text-rose-200">
            {getInitials(user?.firstName, user?.lastName)}
          </span>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-[300] mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover shadow-elevated"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs font-medium text-primary">{roleLabel}</p>
            </div>

            <div className="p-1.5">
              <Link
                href={getProfilePath(roles)}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-muted-foreground" />
                Profile
              </Link>
            </div>

            <div className="border-t border-border p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
