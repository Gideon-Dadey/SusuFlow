'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { getDashboardPath } from '@/lib/utils';
import { AuthGuardSkeleton } from '@/components/ui/skeleton';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
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
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !roles.some((r) => user.roles.includes(r))) {
      router.replace(getDashboardPath(user.roles));
    }
  }, [user, roles, router]);

  if (!user || !roles.some((r) => user.roles.includes(r))) return null;
  return <>{children}</>;
}
