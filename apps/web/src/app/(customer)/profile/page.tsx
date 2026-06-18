'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user, tenantSlug } = useAuthStore();

  return (
    <div className="space-y-4">
      <h1 className="dashboard-title">Profile</h1>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white dashboard-title">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              {user?.roles.map((r) => (
                <Badge key={r} variant="info">
                  {r.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company</span>
            <span className="font-medium">{tenantSlug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">KYC Level</span>
            <Badge variant="warning">Level 0 — Pending</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
