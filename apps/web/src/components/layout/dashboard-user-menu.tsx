"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import { NotificationPanel } from "./notification-panel";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import { tenantApi } from "@/lib/api";
import {
  getInitials,
  getPortalFromPathname,
  getProfilePathForPortal,
  getRoleLabelForPortal,
  getTenantSlug,
} from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardUserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const roles = user?.roles ?? [];
  const portal = getPortalFromPathname(pathname);
  const isSuperAdmin = portal === "admin" || roles.includes("super_admin");
  const roleLabel = getRoleLabelForPortal(portal, roles);
  const profilePath = getProfilePathForPortal(portal, roles);

  const tenantSlug = isSuperAdmin ? "" : user?.tenantSlug || getTenantSlug();
  const { data: tenantBranding } = useQuery({
    queryKey: ["tenant-branding", tenantSlug],
    queryFn: () => tenantApi.getBySlug(tenantSlug),
    enabled: !!tenantSlug && !isSuperAdmin,
  });

  const avatarSrc =
    user?.avatarUrl || (!isSuperAdmin ? tenantBranding?.logoUrl : null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <div ref={rootRef} className="flex items-center gap-1 sm:gap-2">
      <ThemeToggle iconOnly />

      <NotificationPanel />

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-card ring-2 ring-background transition-shadow hover:shadow-md"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={
                user?.firstName ? `${user.firstName} Avatar` : "Profile Avatar"
              }
              className="size-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-foreground">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
          )}
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-[300] mt-2 w-52 overflow-hidden rounded-none border border-border bg-popover shadow-elevated"
          >
            <div className="border-b border-border p-3">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                  : "User Account"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </p>
              <p className="mt-1 text-[11px] font-medium text-primary">
                {roleLabel}
              </p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <Link
                href={profilePath}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-4 w-4 text-muted-foreground"
                />
                <span>Profile & Settings</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="h-4 w-4"
                />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
