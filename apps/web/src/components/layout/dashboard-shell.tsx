'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { BottomNav } from '@/components/layout/bottom-nav';

interface DashboardShellProps {
  children: React.ReactNode;
  variant: 'staff' | 'admin' | 'customer';
  showBottomNav?: boolean;
}

export function DashboardShell({
  children,
  variant,
  showBottomNav = variant !== 'admin',
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="dashboard-shell">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar
        variant={
          variant === 'admin' ? 'admin' : 'staff'
        }
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        customerMode={variant === 'customer'}
      />

      <div className="dashboard-content-column">
        <DashboardHeader variant={variant} onMenuClick={() => setSidebarOpen(true)} />
        <main
          data-portal={variant}
          className={cn(
            'dashboard-scroll p-4 sm:p-6 lg:p-8',
            showBottomNav && 'pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-8',
            sidebarOpen && 'overflow-hidden lg:overflow-y-auto',
          )}
        >
          <div className="dashboard-page mx-auto max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>

      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
