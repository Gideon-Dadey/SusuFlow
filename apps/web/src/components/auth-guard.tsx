"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getDashboardPath } from "@/lib/utils";
import { AuthGuardSkeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || !user) {
    return <AuthGuardSkeleton />;
  }

  return <>{children}</>;
}

export function RoleGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (user && !roles.some((r) => user.roles.includes(r))) {
      router.replace(getDashboardPath(user.roles));
    }
  }, [mounted, user, roles, router]);

  if (!mounted || !user) return <AuthGuardSkeleton />;
  if (!roles.some((r) => user.roles.includes(r))) {
    return <AuthGuardSkeleton />;
  }

  return <>{children}</>;
}
