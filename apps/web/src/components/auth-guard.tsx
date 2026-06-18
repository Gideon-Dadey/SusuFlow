'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { getDashboardPath } from '@/lib/utils';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
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
