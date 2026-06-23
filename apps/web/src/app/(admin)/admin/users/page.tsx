'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserGear, faUserTag, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default function AdminUsersPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-global-users'],
    queryFn: () => adminApi.getUsers(),
  });

  const users = usersData?.items ?? [];

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin')) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 text-xs font-semibold">
          <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
          Super Admin
        </span>
      );
    }
    if (roles.includes('company_admin')) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 text-xs font-semibold">
          <FontAwesomeIcon icon={faUserGear} className="h-3 w-3" />
          Company Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
        <FontAwesomeIcon icon={faUserTag} className="h-3 w-3" />
        Staff Account
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Platform Users & Personnel</h1>
      </div>

      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Personnel Registry ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No personnel registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Role Designation</th>
                    <th className="py-3 px-4">Security</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((user: any) => {
                    const roles = user.userRoles?.map((ur: any) => ur.role?.name) ?? [];
                    return (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            {user.tenant?.name || 'Platform (Global)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getRoleBadge(roles)}
                        </td>
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          {user.emailVerified ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              <FontAwesomeIcon icon={faCircleCheck} className="mr-1 h-3.5 w-3.5 inline" />
                              Email Verified
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 italic">Unverified</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <StatusBadge status={user.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
