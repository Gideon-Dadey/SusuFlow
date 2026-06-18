'use client';

import { AuthGuard, RoleGuard } from '@/components/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard roles={['customer']}>
        <DashboardShell variant="customer">{children}</DashboardShell>
      </RoleGuard>
    </AuthGuard>
  );
}
