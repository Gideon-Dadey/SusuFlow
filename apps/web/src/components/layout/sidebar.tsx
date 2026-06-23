'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';
import {
  adminLinks,
  customerLinks,
  staffLinks,
  staffNavGroups,
  type NavItem,
  type NavGroup,
} from '@/lib/dashboard-nav';

interface SidebarProps {
  variant?: 'staff' | 'admin';
  customerMode?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClose,
}: NavItem & { active: boolean; onClose?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4 shrink-0 opacity-80" />
      {label}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="mt-4 mb-1 block px-2.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground/60 uppercase first:mt-0">
      {label}
    </span>
  );
}

export function Sidebar({
  variant = 'staff',
  customerMode = false,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const brandLabel =
    variant === 'admin' ? 'SusuFlow Admin' : customerMode ? 'My Susu' : 'SusuFlow';

  const isGrouped = variant === 'staff' && !customerMode;

  const flatLinks = customerMode
    ? customerLinks
    : variant === 'admin'
      ? adminLinks
      : staffLinks;

  return (
    <aside
      className={cn(
        'dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[var(--dashboard-sidebar-width)] flex-col border-r border-border bg-background transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          SF
        </div>
        <span className="truncate text-sm font-semibold text-foreground">{brandLabel}</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {isGrouped
          ? staffNavGroups.map((group) => (
              <div key={group.groupLabel}>
                <SectionLabel label={group.groupLabel} />
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <NavLink
                      key={item.href}
                      {...item}
                      active={active}
                      onClose={onClose}
                    />
                  );
                })}
              </div>
            ))
          : flatLinks?.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink key={item.href} {...item} active={active} onClose={onClose} />
              );
            })}
      </nav>
    </aside>
  );
}
