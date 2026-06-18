'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { getGreeting, getInitials } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const titles: Record<string, string> = {
  '/staff/dashboard': 'Dashboard',
  '/staff/customers': 'Customers',
  '/staff/deposits': 'Deposits',
  '/staff/withdrawals': 'Withdrawals',
  '/staff/settings': 'Settings',
  '/collector/dashboard': 'Dashboard',
  '/collector/customers': 'Customers',
  '/collector/deposit': 'Assist Deposit',
  '/admin/tenants': 'Tenants',
  '/dashboard': 'Home',
  '/deposit': 'Deposit',
  '/transactions': 'History',
  '/profile': 'Profile',
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  variant: 'staff' | 'collector' | 'admin' | 'customer';
}

export function DashboardHeader({ onMenuClick, variant }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const mobileTitle =
    titles[pathname] ||
    (variant === 'admin'
      ? 'Platform Admin'
      : variant === 'collector'
        ? 'Collector'
        : variant === 'staff'
          ? 'Staff Portal'
          : 'My Savings');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="dashboard-header flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="dashboard-title truncate">{mobileTitle}</p>
          <p className="dashboard-subtitle hidden text-muted-foreground sm:block">
            {getGreeting()}, {user?.firstName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleLogout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
