'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLockup } from '@/components/marketing/brand-logo';
import { NAV_LINKS } from '@/lib/marketing-data';
import { cn } from '@/lib/utils';

const LIGHT_HERO_PATHS = ['/', '/how-it-works', '/pricing', '/about', '/contact'] as const;

function hasLightHero(pathname: string) {
  return LIGHT_HERO_PATHS.some((path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path),
  );
}
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
  const onDarkNav = spread && !hasLightHero(pathname) && !menuOpen;

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
              menuOpen
                ? 'rounded-none border-b border-border bg-white px-4 dark:bg-background sm:px-5'
                : spread
                  ? 'px-0'
                  : 'marketing-nav-pill px-4 sm:px-6 lg:px-8',
              !spread && showBar && !menuOpen && 'marketing-nav-pill--active',
            )}
          >
            <Link href="/" className="relative z-10 flex min-w-0 shrink-0 items-center">
              <BrandLockup priority onDark={onDarkNav} />
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
                        ? onDarkNav
                          ? active
                            ? 'text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                          : active
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
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

            <div className="relative z-10 flex shrink-0 items-center gap-3 sm:gap-3">
              <Link
                href="/login"
                className={cn(
                  'inline-flex px-1 py-2 text-sm font-medium transition-colors lg:hidden',
                  spread
                    ? onDarkNav
                      ? 'text-white/90 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className={cn(
                  'hidden rounded-full px-3 py-2 text-sm font-medium transition-colors lg:inline-flex',
                  spread
                    ? onDarkNav
                      ? 'text-white/90 hover:bg-white/10 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
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
                      ? onDarkNav
                        ? 'border-0 bg-white text-brand-dark shadow-lg hover:bg-white/95'
                        : 'shadow-[0_6px_18px_rgba(34,197,94,0.28)]'
                      : 'shadow-[0_6px_18px_rgba(34,197,94,0.28)]',
                  )}
                >
                  Get started
                </Button>
              </Link>

              <button
                type="button"
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-lg border transition-colors lg:hidden',
                  menuOpen
                    ? 'border-border bg-muted/60 text-foreground hover:bg-muted'
                    : spread
                      ? onDarkNav
                        ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                        : 'border-border bg-card text-foreground hover:bg-muted'
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
              className="fixed inset-x-0 bottom-0 z-[190] bg-white dark:bg-background lg:hidden"
              style={{ top: 'var(--marketing-header-height, 4.5rem)' }}
            >
              <nav className="h-full overflow-y-auto" aria-label="Mobile">
                {NAV_LINKS.map(({ href, label }, index) => {
                  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center px-6 py-4 text-base font-bold text-foreground transition-colors hover:bg-muted/40',
                        index > 0 && 'border-t border-border',
                        active && 'text-secondary',
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  );
                })}

                <div className="border-t border-border px-6 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="h-12 w-full rounded-lg text-sm font-semibold shadow-[0_4px_14px_rgba(34,197,94,0.25)]">
                      Get started
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
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
