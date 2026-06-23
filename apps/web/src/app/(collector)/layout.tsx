"use client";

import { AuthGuard, RoleGuard } from "@/components/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard roles={["collector"]}>
        <DashboardShell variant="collector">{children}</DashboardShell>
      </RoleGuard>
    </AuthGuard>
  );
}
