'use client';

import { AuthGuard, RoleGuard } from '@/components/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard roles={['super_admin']}>
        <DashboardShell variant="admin" showBottomNav={false}>
          {children}
        </DashboardShell>
      </RoleGuard>
    </AuthGuard>
  );
}
