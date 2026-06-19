import { Suspense } from 'react';
import { TenantListSkeleton } from '@/components/ui/skeleton';
import AdminTenantsPage from './tenants-content';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-6">
          <TenantListSkeleton count={3} />
        </div>
      }
    >
      <AdminTenantsPage />
    </Suspense>
  );
}
