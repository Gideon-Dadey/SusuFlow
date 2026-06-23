'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/settings');
  }, [router]);

  return null;
}
