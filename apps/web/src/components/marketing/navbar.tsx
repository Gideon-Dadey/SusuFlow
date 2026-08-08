"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { NAV_LINKS } from "@/lib/marketing-data";
import { cn, getDashboardPath, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div
      className="relative flex h-[18px] w-[22px] flex-col justify-between"
      aria-hidden
    >
      <span
        className={cn(
          "h-[2px] w-full rounded-full bg-current transform-gpu transition-all duration-300",
          open && "translate-y-[8px] rotate-45",
        )}
      />
      <span
        className={cn(
          "h-[2px] w-[15px] self-end rounded-full bg-current transition-all duration-200",
          open && "opacity-0 translate-x-3",
        )}
      />
      <span
        className={cn(
          "h-[2px] w-full rounded-full bg-current transform-gpu transition-all duration-300",
          open && "-translate-y-[8px] -rotate-45",
        )}
      />
    </div>
  );
}

function isNavLinkActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const dashboardPath = user
    ? getDashboardPath(user.roles || [])
    : "/dashboard";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-[400] bg-background pt-[env(safe-area-inset-top,0px)]">
        <div className="marketing-container flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-10 flex min-w-0 shrink-0 items-center"
          >
            <BrandLockup priority />
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex xl:gap-2"
            aria-label="Main"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const active = isNavLinkActive(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-2 text-base font-normal transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-3">
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted"
                  aria-label="User menu"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {getInitials(user.firstName, user.lastName)}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-[300] mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="space-y-1 pt-1.5">
                      <Link
                        href={dashboardPath}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Go to Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 py-2 text-base font-normal text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
                >
                  Login
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-full bg-foreground px-6 text-base font-medium text-background hover:opacity-90"
                  >
                    <span>Register</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-foreground transition-opacity hover:opacity-70 lg:hidden"
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
              className="fixed inset-x-0 bottom-0 z-[190] flex flex-col bg-background lg:hidden"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 4.5rem)" }}
            >
              <nav
                className="flex-1 overflow-y-auto px-6 py-8"
                aria-label="Mobile"
              >
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ href, label }) => {
                    const active = isNavLinkActive(pathname, href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex min-h-[48px] items-center px-2 py-3 text-[17px] font-medium transition-colors",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8">
                  {isAuthenticated && user ? (
                    <>
                      <Link
                        href={dashboardPath}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Button className="h-12 w-full rounded-full font-medium">
                          Go to Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="h-12 w-full rounded-full font-medium"
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="h-12 w-full rounded-full text-base font-medium"
                        >
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)}>
                        <Button className="h-12 w-full rounded-full text-base font-medium">
                          Register
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
