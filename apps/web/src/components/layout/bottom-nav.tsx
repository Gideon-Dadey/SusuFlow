'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh,
  faHandHoldingDollar,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/lib/utils';
import { collectorLinks, customerLinks, staffLinks } from '@/lib/dashboard-nav';
import { useAuthStore } from '@/stores/auth.store';

const collectorMobileNav: { href: string; label: string; icon: IconDefinition }[] = [
  { href: '/collector/dashboard', label: 'Home', icon: faGaugeHigh },
  { href: '/collector/customers', label: 'Customers', icon: faUsers },
  { href: '/collector/deposit', label: 'Deposit', icon: faHandHoldingDollar },
  { href: '/collector/profile', label: 'Profile', icon: faUser },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const isCollector = user?.roles.includes('collector');
  const isStaff =
    user?.roles.includes('company_admin') || user?.roles.includes('account_officer');

  const nav = isStaff
    ? staffLinks.slice(0, 4)
    : isCollector
      ? collectorMobileNav
      : customerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <FontAwesomeIcon icon={icon} className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
