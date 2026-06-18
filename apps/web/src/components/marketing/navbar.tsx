'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { BrandLockup } from '@/components/marketing/brand-logo';
import { NAV_LINKS } from '@/lib/marketing-data';
import { cn } from '@/lib/utils';

const TOP_THRESHOLD = 24;
const SCROLL_DELTA = 6;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-[18px]" aria-hidden>
      <span
        className={cn(
          'absolute left-0 top-1 h-0.5 w-full rounded-full bg-current transition-all duration-200',
          open && 'top-[9px] rotate-45',
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200',
          open && 'opacity-0',
        )}
      />
      <span
        className={cn(
          'absolute bottom-1 left-0 h-0.5 w-full rounded-full bg-current transition-all duration-200',
          open && 'bottom-[9px] -rotate-45',
        )}
      />
    </span>
  );
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const isAtTop = y <= TOP_THRESHOLD;

      setAtTop(isAtTop);

      if (isAtTop) {
        setVisible(true);
      } else if (y > lastScrollY.current + SCROLL_DELTA) {
        setVisible(false);
      } else if (y < lastScrollY.current - SCROLL_DELTA) {
        setVisible(true);
      }

      lastScrollY.current = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const spread = atTop && !menuOpen;
  const showBar = visible || menuOpen;

  return (
    <>
      <header
        className={cn(
          'marketing-header-gap pointer-events-none fixed inset-x-0 top-0 z-[200]',
          'transition-[transform,opacity] duration-300 ease-out',
          !showBar && '-translate-y-[calc(100%+1rem)] opacity-0',
        )}
      >
        <div className="marketing-container pointer-events-auto">
          <div
            className={cn(
              'marketing-nav-bar relative flex h-14 items-center justify-between gap-3 sm:h-[3.75rem]',
              spread ? 'px-0' : 'marketing-nav-pill px-4 sm:px-6 lg:px-8',
              !spread && showBar && 'marketing-nav-pill--active',
            )}
          >
            <Link href="/" className="relative z-10 flex min-w-0 shrink-0 items-center">
              <BrandLockup priority onDark={spread} />
            </Link>

            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex xl:gap-1"
              aria-label="Main"
            >
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                      spread
                        ? active
                          ? 'text-white'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                        : active
                          ? 'text-secondary'
                          : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className={cn(
                  'hidden rounded-full px-3 py-2 text-sm font-medium transition-colors lg:inline-flex',
                  spread
                    ? 'text-white/90 hover:bg-white/10 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sign in
              </Link>
              <Link href="/register" className="hidden lg:block">
                <Button
                  size="sm"
                  className={cn(
                    'h-10 rounded-full px-4 text-sm font-semibold',
                    spread
                      ? 'border-0 bg-white text-brand-dark shadow-lg hover:bg-white/95'
                      : 'shadow-[0_6px_18px_rgba(34,197,94,0.28)]',
                  )}
                >
                  Get started
                </Button>
              </Link>

              <button
                type="button"
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-full border transition-colors lg:hidden',
                  spread
                    ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                    : 'border-border bg-card text-foreground hover:bg-muted',
                )}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <MenuIcon open={menuOpen} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mounted && menuOpen
        ? createPortal(
            <div
              id="mobile-nav"
              className="fixed inset-0 z-[190] bg-brand-dark dark:bg-background lg:hidden"
              style={{ paddingTop: 'var(--marketing-header-height, 4.5rem)' }}
            >
              <nav className="flex h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4" aria-label="Mobile">
                <div className="flex flex-1 flex-col items-center justify-center gap-8 py-6 sm:gap-9 sm:py-8">
                  {NAV_LINKS.map(({ href, label }) => {
                    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'block text-center text-[1.625rem] font-bold leading-tight tracking-tight transition-colors',
                          active ? 'text-white' : 'text-[#B0B5C0] hover:text-white',
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mx-auto flex w-full max-w-md flex-col gap-3 pt-4">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <span className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/25 bg-transparent text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/5">
                      Sign in
                    </span>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <span className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-dark transition-colors hover:bg-white/95">
                      Get started
                    </span>
                  </Link>
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
