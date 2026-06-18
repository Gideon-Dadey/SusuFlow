'use client';

import { AuthGuard, RoleGuard } from '@/components/auth-guard';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard roles={['company_admin', 'account_officer', 'auditor']}>
        <DashboardShell variant="staff">{children}</DashboardShell>
      </RoleGuard>
    </AuthGuard>
  );
}
