'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Settings,
  LogOut,
  HandCoins,
  Building2,
  History,
  User,
} from 'lucide-react';

const staffLinks = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/customers', label: 'Customers', icon: Users },
  { href: '/staff/deposits', label: 'Deposits', icon: Wallet },
  { href: '/staff/withdrawals', label: 'Withdrawals', icon: FileText },
  { href: '/staff/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { href: '/admin/tenants', label: 'Tenants', icon: Building2 },
  { href: '/admin/tenants/new', label: 'New organization', icon: Users },
];

const collectorLinks = [
  { href: '/collector/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/collector/customers', label: 'Customers', icon: Users },
  { href: '/collector/deposit', label: 'Assist Deposit', icon: HandCoins },
];

const customerLinks = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/deposit', label: 'Deposit', icon: Wallet },
  { href: '/transactions', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  variant?: 'staff' | 'collector' | 'admin';
  customerMode?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  variant = 'staff',
  customerMode = false,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const links = customerMode
    ? customerLinks
    : variant === 'collector'
      ? collectorLinks
      : variant === 'admin'
        ? adminLinks
        : staffLinks;

  const brandLabel =
    variant === 'admin' ? 'SusuFlow Admin' : customerMode ? 'My Susu' : 'SusuFlow';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
          SF
        </div>
        <span className="font-semibold text-foreground">{brandLabel}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
