"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { NAV_LINKS } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

const LIGHT_HERO_PATHS = [
  "/",
  "/how-it-works",
  "/pricing",
  "/about",
  "/contact",
] as const;

function hasLightHero(pathname: string) {
  return LIGHT_HERO_PATHS.some((path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path),
  );
}
const TOP_THRESHOLD = 24;
const SCROLL_DELTA = 6;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-[18px]" aria-hidden>
      <span
        className={cn(
          "absolute left-0 top-1 h-0.5 w-full rounded-full bg-current transition-all duration-200",
          open && "top-[9px] rotate-45",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute bottom-1 left-0 h-0.5 w-full rounded-full bg-current transition-all duration-200",
          open && "bottom-[9px] -rotate-45",
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[200] border-b border-slate-200/60 bg-[#f4f6f8]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#090d16]/95">
        <div className="marketing-container flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-10 flex min-w-0 shrink-0 items-center"
          >
            <BrandLockup priority />
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex xl:gap-5"
            aria-label="Main"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-2 text-[17px] font-semibold transition-colors",
                    active
                      ? "text-[#0056d2] dark:text-[#38bdf8] font-bold"
                      : "text-slate-800 hover:text-[#0056d2] dark:text-slate-200 dark:hover:text-white",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-4">
            <Link
              href="/login"
              className="inline-flex px-1 py-2 text-[17px] font-semibold text-slate-800 hover:text-[#0056d2] dark:text-slate-200 dark:hover:text-white lg:hidden"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="hidden px-3 py-2 text-[17px] font-semibold text-slate-800 hover:text-[#0056d2] dark:text-slate-200 dark:hover:text-white lg:inline-flex"
            >
              Login
            </Link>
            <Link href="/register" className="hidden lg:block">
              <Button
                size="sm"
                className="h-10 px-5 text-[15px] font-bold rounded-[0.2rem] bg-[#0056d2] hover:bg-[#0043aa] text-white transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <span>Register</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </Button>
            </Link>

            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {mounted && menuOpen
        ? createPortal(
            <div
              id="mobile-nav"
              className="fixed inset-x-0 bottom-0 z-[190] bg-white dark:bg-background lg:hidden"
              style={{ top: "var(--marketing-header-height, 4.5rem)" }}
            >
              <nav className="h-full overflow-y-auto" aria-label="Mobile">
                {NAV_LINKS.map(({ href, label }, index) => {
                  const active =
                    href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center px-6 py-4 text-[18px] font-bold text-foreground transition-colors hover:bg-muted/40",
                        index > 0 && "border-t border-border",
                        active && "text-secondary",
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  );
                })}

                <div className="border-t border-border px-6 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="h-12 w-full rounded-md text-[15px] font-bold shadow-[0_4px_14px_rgba(34,197,94,0.25)]">
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
