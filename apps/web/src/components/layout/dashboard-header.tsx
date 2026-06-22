'use client';

import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { DashboardUserMenu } from '@/components/layout/dashboard-user-menu';

const titles: Record<string, string> = {
  '/staff/dashboard': 'Dashboard',
  '/staff/customers': 'Customers',
  '/staff/deposits': 'Deposits',
  '/staff/withdrawals': 'Withdrawals',
  '/staff/settings': 'Settings',
  '/staff/profile': 'Profile',
  '/admin/tenants': 'Tenants',
  '/admin/profile': 'Profile',
  '/dashboard': 'Home',
  '/deposit': 'Deposit',
  '/transactions': 'History',
  '/profile': 'Profile',
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  variant: 'staff' | 'admin' | 'customer';
}

export function DashboardHeader({ onMenuClick, variant }: DashboardHeaderProps) {
  const pathname = usePathname();

  const mobileTitle =
    titles[pathname] ||
    (variant === 'admin'
      ? 'Platform Admin'
      : variant === 'staff'
        ? 'Staff Portal'
        : 'My Savings');

  return (
    <header className="dashboard-header flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        </Button>
        <p className="dashboard-title min-w-0 truncate">{mobileTitle}</p>
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <DashboardUserMenu />
      </div>
    </header>
  );
}
