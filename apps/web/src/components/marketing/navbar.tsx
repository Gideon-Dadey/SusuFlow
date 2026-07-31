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

  const isHomePage = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[200] bg-white dark:bg-[#09090b] pt-[env(safe-area-inset-top,0px)] transition-all",
          isHomePage
            ? "border-b-0 border-none"
            : "border-b border-slate-200/80 dark:border-slate-800/80",
        )}
      >
        <div className="marketing-container flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-4">
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
                (href as string) === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-2 text-[17px] font-semibold transition-colors",
                    active
                      ? "text-[#0066cc] dark:text-[#38bdf8] font-bold"
                      : "text-slate-800 hover:text-[#0066cc] dark:text-slate-200 dark:hover:text-white",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="inline-flex text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0066cc] dark:hover:text-white lg:hidden"
            >
              Sign in
            </Link>

            <Link
              href="/login"
              className="hidden px-3 py-2 text-[17px] font-semibold text-slate-800 hover:text-[#0066cc] dark:text-slate-200 dark:hover:text-white lg:inline-flex"
            >
              Login
            </Link>

            <Link href="/register" className="hidden sm:block">
              <Button
                size="sm"
                className="h-9 sm:h-10 px-3.5 sm:px-5 text-xs sm:text-[15px] font-bold rounded-md bg-[#0066cc] hover:bg-[#0052a3] text-white transition-all duration-200 shadow-sm flex items-center justify-center"
              >
                <span>Register</span>
              </Button>
            </Link>

            <button
              type="button"
              className="inline-flex p-1.5 text-slate-700 dark:text-slate-200 hover:text-slate-900 transition-colors lg:hidden"
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
              className="fixed inset-x-0 bottom-0 z-[190] bg-white dark:bg-[#09090b] lg:hidden flex flex-col border-t border-slate-200/80 dark:border-slate-800 shadow-2xl"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}
            >
              <nav
                className="flex-1 overflow-y-auto px-6 py-6"
                aria-label="Mobile"
              >
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ href, label }) => {
                    const active =
                      (href as string) === "/"
                        ? pathname === "/"
                        : pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3.5 py-3 text-[15px] font-semibold transition-all",
                          active
                            ? "bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#0066cc]/20 dark:text-[#38bdf8]"
                            : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60",
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{label}</span>
                        <ChevronDown
                          className="size-4 -rotate-90 text-muted-foreground"
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="h-12 w-full rounded-md text-[15px] font-bold bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-md flex items-center justify-center gap-2">
                      <span>Create Free Account</span>
                      <ArrowRight className="size-4 stroke-[2.5]" aria-hidden />
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
