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
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { NAV_LINKS } from "@/lib/marketing-data";
import { cn, getDashboardPath, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import {
  PRODUCT_MEGA_MENU,
  WHY_SUSUFLOW_MEGA_MENU,
  MegaDropdown,
  MegaMenuConfig,
} from "./mega-menu";

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
    <div
      className="relative flex h-[18px] w-[22px] flex-col justify-between"
      aria-hidden
    >
      <span
        className={cn(
          "h-[2px] w-full rounded-full bg-current transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open && "translate-y-[8px] rotate-45",
        )}
      />
      <span
        className={cn(
          "h-[2px] w-[15px] self-end rounded-full bg-current transition-all duration-200 ease-in-out",
          open && "opacity-0 translate-x-3",
        )}
      />
      <span
        className={cn(
          "h-[2px] w-full rounded-full bg-current transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open && "-translate-y-[8px] -rotate-45",
        )}
      />
    </div>
  );
}

export function MarketingNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<
    "Product" | "Why SusuFlow" | null
  >(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(
    null,
  );

  const [atTop, setAtTop] = useState(true);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const megaMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const dashboardPath = user
    ? getDashboardPath(user.roles || [])
    : "/dashboard";

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
        setActiveMegaMenu(null);
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
    setUserMenuOpen(false);
    setActiveMegaMenu(null);
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

  const getMegaMenuConfig = (label: string): MegaMenuConfig | null => {
    if (label === "Product") return PRODUCT_MEGA_MENU;
    if (label === "Why SusuFlow") return WHY_SUSUFLOW_MEGA_MENU;
    return null;
  };

  const cancelMegaMenuClose = () => {
    if (megaMenuCloseTimer.current) {
      clearTimeout(megaMenuCloseTimer.current);
      megaMenuCloseTimer.current = null;
    }
  };

  const scheduleMegaMenuClose = () => {
    cancelMegaMenuClose();
    megaMenuCloseTimer.current = setTimeout(() => {
      setActiveMegaMenu(null);
      megaMenuCloseTimer.current = null;
    }, 120);
  };

  const openMegaMenu = (label: "Product" | "Why SusuFlow") => {
    cancelMegaMenuClose();
    setActiveMegaMenu(label);
  };

  useEffect(() => {
    return () => {
      if (megaMenuCloseTimer.current) {
        clearTimeout(megaMenuCloseTimer.current);
      }
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[400] pt-[env(safe-area-inset-top,0px)] transition-all",
          activeMegaMenu
            ? "bg-white dark:bg-[#09090b]"
            : "bg-white/95 backdrop-blur-md border-b border-border/60",
        )}
      >
        <div className="marketing-container flex h-[4.5rem] sm:h-22 items-center justify-between gap-3 sm:gap-4 relative">
          <Link
            href="/"
            className="relative z-10 flex min-w-0 shrink-0 items-center"
          >
            <BrandLockup priority />
          </Link>

          {/* Desktop Navigation with Mega Menus */}
          <nav
            ref={navContainerRef}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex xl:gap-3"
            aria-label="Main"
            onMouseLeave={scheduleMegaMenuClose}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const hasMega = label === "Product" || label === "Why SusuFlow";
              const isOpen = activeMegaMenu === label;
              const active =
                (href as string) === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);

              if (hasMega) {
                return (
                  <div
                    key={label}
                    className="relative"
                    onMouseEnter={() =>
                      openMegaMenu(label as "Product" | "Why SusuFlow")
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMegaMenu((prev) =>
                          prev === label
                            ? null
                            : (label as "Product" | "Why SusuFlow"),
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-2 text-[17px] font-semibold transition-colors rounded-lg",
                        active || isOpen
                          ? "text-[#0066cc] dark:text-[#38bdf8] font-bold"
                          : "text-slate-800 hover:text-[#0066cc] dark:text-slate-200 dark:hover:text-white",
                      )}
                    >
                      <span>{label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200 opacity-70",
                          isOpen &&
                            "rotate-180 text-[#0066cc] dark:text-[#38bdf8]",
                        )}
                      />
                    </button>
                  </div>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  onMouseEnter={() => {
                    cancelMegaMenuClose();
                    setActiveMegaMenu(null);
                  }}
                  className={cn(
                    "px-3.5 py-2 text-[17px] font-semibold transition-colors rounded-lg",
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

          {/* Right Header Controls */}
          <div className="relative z-10 flex shrink-0 items-center gap-3 sm:gap-4">
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-slate-100 transition-all hover:ring-2 hover:ring-[#0066cc]/40 focus:outline-none"
                  aria-label="User menu"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[17px] font-bold text-[#0066cc] dark:text-[#38bdf8]">
                      {getInitials(user.firstName, user.lastName)}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-white dark:bg-[#18181b] p-2 shadow-xl z-[300]">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="font-bold text-[17px] text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="pt-1.5 space-y-1">
                      <Link
                        href={dashboardPath}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[17px] font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#0066cc]" />
                        <span>Go to Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[17px] font-semibold text-destructive hover:bg-destructive/10 transition-colors"
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
                  className="hidden px-3 py-2 text-[17px] font-semibold text-slate-800 hover:text-[#0066cc] dark:text-slate-200 dark:hover:text-white lg:inline-flex"
                >
                  Login
                </Link>

                <Link href="/register" className="hidden sm:block">
                  <Button className="h-12 px-8 text-[17px] font-semibold rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2.5">
                    <span>Register</span>
                    <ArrowRight
                      className="h-[18px] w-[18px] stroke-[2.25]"
                      aria-hidden
                    />
                  </Button>
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-slate-800 dark:text-slate-200 transition-opacity hover:opacity-80 active:scale-95 focus:outline-none lg:hidden"
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

      {activeMegaMenu && getMegaMenuConfig(activeMegaMenu) && (
        <MegaDropdown
          config={getMegaMenuConfig(activeMegaMenu)!}
          isOpen={!!activeMegaMenu}
          onClose={() => setActiveMegaMenu(null)}
          onMouseEnter={cancelMegaMenuClose}
        />
      )}

      {/* Mobile Drawer Navigation */}
      {mounted && menuOpen
        ? createPortal(
            <div
              id="mobile-nav"
              className="fixed inset-x-0 bottom-0 z-[190] bg-white dark:bg-[#09090b] lg:hidden flex flex-col border-t border-border/60 shadow-2xl"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 4.5rem)" }}
            >
              <nav
                className="flex-1 overflow-y-auto px-6 py-8"
                aria-label="Mobile"
              >
                <div className="flex flex-col gap-2.5">
                  {NAV_LINKS.map(({ href, label }) => {
                    const megaConfig = getMegaMenuConfig(label);
                    const isExpanded = expandedMobileMenu === label;
                    const active =
                      (href as string) === "/"
                        ? pathname === "/"
                        : pathname.startsWith(href);

                    if (megaConfig) {
                      return (
                        <div key={label} className="space-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMobileMenu(isExpanded ? null : label)
                            }
                            className={cn(
                              "flex w-full min-h-[52px] items-center justify-between rounded-xl px-4 py-3.5 text-[17px] font-bold tracking-tight transition-all",
                              active || isExpanded
                                ? "bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#0066cc]/20 dark:text-[#38bdf8]"
                                : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60",
                            )}
                          >
                            <span>{label}</span>
                            <ChevronDown
                              className={cn(
                                "size-5 text-muted-foreground/80 transition-transform duration-200",
                                isExpanded && "rotate-180 text-[#0066cc]",
                              )}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-6 px-1 mb-4">
                              {megaConfig.categories.map((cat) => (
                                <div key={cat.title} className="space-y-3">
                                  <p className="text-[15px] font-bold text-slate-900 text-foreground">
                                    {cat.title}
                                  </p>
                                  <div className="flex flex-col gap-4">
                                    {cat.items.map((item) => (
                                      <Link
                                        key={item.title}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="group flex items-start gap-3 transition-colors"
                                      >
                                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-slate-50 text-slate-500 transition-colors group-hover:border-[#0066cc]/30 group-hover:bg-[#0066cc]/5 group-hover:text-[#0066cc] dark:text-slate-400">
                                          <FontAwesomeIcon
                                            icon={item.icon}
                                            className="h-[14px] w-[14px]"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-[14px] font-bold text-slate-900 transition-colors group-hover:text-[#0066cc] text-foreground">
                                            {item.title}
                                          </p>
                                          <p className="text-[13px] leading-snug text-slate-600 dark:text-slate-400">
                                            {item.description}
                                          </p>
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex min-h-[52px] items-center justify-between rounded-xl px-4 py-3.5 text-[17px] font-bold tracking-tight transition-all",
                          active
                            ? "bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#0066cc]/20 dark:text-[#38bdf8]"
                            : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60",
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>{label}</span>
                        <ChevronDown
                          className="size-5 -rotate-90 text-muted-foreground/80"
                          aria-hidden
                        />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-10 flex flex-col gap-3.5 border-t border-border/60 pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 px-1 mb-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#0066cc]/10 text-[#0066cc] font-bold text-[17px] shrink-0">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[17px] text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={dashboardPath}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Button className="h-12 w-full rounded-xl text-[17px] font-semibold bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-md flex items-center justify-center gap-2.5">
                          <span>Go to Dashboard</span>
                          <ArrowRight
                            className="h-[18px] w-[18px] stroke-[2.25]"
                            aria-hidden
                          />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="h-12 w-full rounded-xl text-[16px] font-semibold border-border/60 text-destructive hover:bg-destructive/10"
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="h-[52px] w-full rounded-xl text-[16px] font-semibold border-border/60 text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Sign in
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)}>
                        <Button className="h-12 w-full rounded-xl text-[17px] font-semibold bg-[#0066cc] hover:bg-[#0052a3] text-white shadow-md flex items-center justify-center gap-2.5">
                          <span>Register</span>
                          <ArrowRight
                            className="h-[18px] w-[18px] stroke-[2.25]"
                            aria-hidden
                          />
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
