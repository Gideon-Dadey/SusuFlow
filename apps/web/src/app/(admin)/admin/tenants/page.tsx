import { Suspense } from 'react';
import AdminTenantsPage from './tenants-content';

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading tenants…</p>}>
      <AdminTenantsPage />
    </Suspense>
  );
}
