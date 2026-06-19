'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Reset scroll position when navigating between marketing routes. */
export function MarketingScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
