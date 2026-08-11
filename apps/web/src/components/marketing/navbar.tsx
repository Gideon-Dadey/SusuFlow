"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "@/components/icons/phosphor";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { MEGA_NAV, type MegaNavItem } from "@/lib/marketing-data";
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

function isMegaItemActive(pathname: string, item: MegaNavItem) {
  if (item.href) {
    return pathname.startsWith(item.href);
  }
  return (
    item.columns?.some((column) =>
      column.links.some((link) => pathname.startsWith(link.href.split("#")[0])),
    ) ?? false
  );
}

function MegaPanel({
  item,
  onNavigate,
}: {
  item: MegaNavItem;
  onNavigate: () => void;
}) {
  if (!item.columns) return null;

  return (
    <div className="absolute inset-x-0 top-full z-[390] border-b border-border/70 bg-[var(--ofx-paper)] shadow-[0_24px_48px_-24px_rgba(28,27,23,0.25)]">
      <div className="marketing-container grid gap-10 py-10 lg:grid-cols-12">
        <div
          className={cn(
            "grid gap-10",
            item.columns.length >= 3
              ? "lg:col-span-9 lg:grid-cols-3"
              : "lg:col-span-8 lg:grid-cols-2",
          )}
        >
          {item.columns.map((column) => (
            <div key={column.heading}>
              <p className="ofx-eyebrow">{column.heading}</p>
              <ul className="mt-5 space-y-1">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.title}`}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className="group block rounded-2xl px-3 py-2.5 -mx-3 transition-colors hover:bg-[var(--ofx-cream-deep)]"
                    >
                      <span className="block text-[15px] font-medium text-foreground">
                        {link.title}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] leading-snug text-muted-foreground">
                        {link.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {item.promo ? (
          <div
            className={cn(
              "flex flex-col justify-between rounded-3xl bg-[var(--ofx-sage)] p-6",
              item.columns.length >= 3 ? "lg:col-span-3" : "lg:col-span-4",
            )}
          >
            <div>
              <p className="text-lg font-medium leading-snug text-foreground">
                {item.promo.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {item.promo.body}
              </p>
            </div>
            <Link
              href={item.promo.href}
              onClick={onNavigate}
              className="ofx-link mt-6 text-sm"
            >
              {item.promo.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const dashboardPath = user
    ? getDashboardPath(user.roles || [])
    : "/dashboard";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMega(null);
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

  useEffect(() => {
    if (!openMega) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMega(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setOpenMega(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMega]);

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMega(null), 140);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-[400] border-b border-border/70 bg-background pt-[env(safe-area-inset-top,0px)]"
      >
        <div className="marketing-container relative flex h-[4.5rem] items-center justify-between gap-4">
          <Link
            href="/"
            className="relative z-10 flex min-w-0 shrink-0 items-center"
          >
            <BrandLockup priority />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main"
            onMouseLeave={scheduleClose}
          >
            {MEGA_NAV.map((item) => {
              const active = isMegaItemActive(pathname, item);

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMega(null);
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-[15.5px] font-normal transition-colors hover:bg-[var(--ofx-cream-deep)]",
                      active ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              const isOpen = openMega === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMega(item.label);
                  }}
                  onClick={() => setOpenMega(isOpen ? null : item.label)}
                  aria-expanded={isOpen}
                  className={cn(
                    "pill flex items-center gap-1 rounded-full px-4 py-2 text-[15.5px] font-normal transition-colors hover:bg-[var(--ofx-cream-deep)]",
                    isOpen && "bg-[var(--ofx-cream-deep)]",
                    active || isOpen ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-3">
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="pill flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-white p-0 transition-colors hover:bg-[var(--ofx-cream-deep)]"
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
                  <div className="absolute right-0 top-full z-[300] mt-2 w-56 rounded-2xl border border-border bg-white p-2 shadow-xl">
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
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--ofx-cream-deep)]"
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
                  className="hidden px-3 py-2 text-[15.5px] font-normal text-foreground/80 transition-colors hover:text-foreground lg:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="ofx-btn ofx-btn-dark ofx-btn-sm hidden sm:inline-flex"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </>
            )}

            <button
              type="button"
              className="pill inline-flex items-center justify-center rounded-full p-2 text-foreground transition-opacity hover:opacity-70 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {openMega ? (
          <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
            <MegaPanel
              item={MEGA_NAV.find((i) => i.label === openMega)!}
              onNavigate={() => setOpenMega(null)}
            />
          </div>
        ) : null}
      </header>

      {mounted && menuOpen
        ? createPortal(
            <div
              id="mobile-nav"
              className="fixed inset-x-0 bottom-0 z-[190] flex flex-col bg-background lg:hidden"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 4.5rem)" }}
            >
              <nav
                className="flex-1 overflow-y-auto px-6 py-6"
                aria-label="Mobile"
              >
                <div className="flex flex-col divide-y divide-border/70">
                  {MEGA_NAV.map((item) => {
                    if (item.href) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex min-h-[54px] items-center text-[17px] font-medium text-foreground"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      );
                    }

                    const expanded = mobileExpanded === item.label;
                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          className="flex min-h-[54px] w-full items-center justify-between p-0 text-[17px] font-medium text-foreground"
                          onClick={() =>
                            setMobileExpanded(expanded ? null : item.label)
                          }
                          aria-expanded={expanded}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform duration-200",
                              expanded && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                        {expanded && (
                          <div className="space-y-5 pb-5">
                            {item.columns?.map((column) => (
                              <div key={column.heading}>
                                <p className="ofx-eyebrow text-xs">
                                  {column.heading}
                                </p>
                                <ul className="mt-2.5 space-y-2.5">
                                  {column.links.map((link) => (
                                    <li key={`${link.href}-${link.title}`}>
                                      <Link
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block text-[15px] text-foreground/85"
                                      >
                                        {link.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
                  {isAuthenticated && user ? (
                    <>
                      <Link
                        href={dashboardPath}
                        onClick={() => setMenuOpen(false)}
                        className="ofx-btn ofx-btn-dark w-full"
                      >
                        Go to Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="ofx-btn ofx-btn-outline w-full"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        onClick={() => setMenuOpen(false)}
                        className="ofx-btn ofx-btn-dark w-full"
                      >
                        Get started for free
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="ofx-btn ofx-btn-outline w-full"
                      >
                        Login
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
