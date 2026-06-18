'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Wallet, History, User, Users, LayoutDashboard, HandCoins } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const customerNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/deposit', label: 'Deposit', icon: Wallet },
  { href: '/transactions', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

const collectorNav = [
  { href: '/collector/dashboard', label: 'Home', icon: Home },
  { href: '/collector/customers', label: 'Customers', icon: Users },
  { href: '/collector/deposit', label: 'Deposit', icon: HandCoins },
  { href: '/profile', label: 'Profile', icon: User },
];

const staffNav = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/staff/customers', label: 'Customers', icon: Users },
  { href: '/staff/deposits', label: 'Deposits', icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const isCollector = user?.roles.includes('collector');
  const isStaff =
    user?.roles.includes('company_admin') || user?.roles.includes('account_officer');

  const nav = isStaff ? staffNav : isCollector ? collectorNav : customerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:hidden safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
                active ? 'text-secondary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
