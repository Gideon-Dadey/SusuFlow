"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";
import {
  adminLinks,
  adminNavGroups,
  customerLinks,
  collectorLinks,
  staffLinks,
  staffNavGroups,
  type NavItem,
  type NavGroup,
} from "@/lib/dashboard-nav";

import { useQuery } from "@tanstack/react-query";
import { tenantApi } from "@/lib/api";
import { getTenantSlug } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { SusuFlowIconMark } from "@/components/marketing/brand-logo";

interface SidebarProps {
  variant?: "staff" | "admin";
  customerMode?: boolean;
  collectorMode?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function NavLink({
  href,
  label,
  icon,
  active,
  onClose,
}: NavItem & { active: boolean; onClose?: () => void }) {
  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onClose}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors",
        active
          ? "bg-muted text-foreground font-semibold"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4 shrink-0 opacity-80" />
      {label}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="mt-4 mb-1 block px-2.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground/60 uppercase first:mt-0">
      {label}
    </span>
  );
}

export function Sidebar({
  variant = "staff",
  customerMode = false,
  collectorMode = false,
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdmin = variant === "admin" || user?.roles?.includes("super_admin");
  const tenantSlug = isAdmin ? "" : user?.tenantSlug || getTenantSlug();
  const { data: tenantBranding } = useQuery({
    queryKey: ["tenant-branding", tenantSlug],
    queryFn: () => tenantApi.getBySlug(tenantSlug),
    enabled: !!tenantSlug && !isAdmin,
  });

  const brandLabel =
    variant === "admin"
      ? "SusuFlow Admin"
      : tenantBranding?.name ||
        (collectorMode ? "Collector" : customerMode ? "My Susu" : "SusuFlow");

  const isGrouped =
    (variant === "staff" || variant === "admin") &&
    !customerMode &&
    !collectorMode;
  const navGroups = variant === "admin" ? adminNavGroups : staffNavGroups;

  const flatLinks = collectorMode
    ? collectorLinks
    : customerMode
      ? customerLinks
      : variant === "admin"
        ? adminLinks
        : staffLinks;

  return (
    <aside
      className={cn(
        "dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[var(--dashboard-sidebar-width)] flex-col border-r border-border bg-background transition-transform duration-200 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        {variant === "admin" ? (
          <SusuFlowIconMark className="h-7 w-auto max-w-[7.5rem] shrink-0" />
        ) : tenantBranding?.logoUrl ? (
          <img
            src={tenantBranding.logoUrl}
            alt={brandLabel}
            className="h-8 w-8 rounded-md object-contain bg-transparent shrink-0"
          />
        ) : (
          <SusuFlowIconMark className="h-7 w-auto max-w-[7.5rem] shrink-0" />
        )}
        <span className="truncate text-sm font-semibold text-foreground">
          {brandLabel}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2.5">
        {isGrouped
          ? navGroups.map((group) => (
              <div key={group.groupLabel}>
                <SectionLabel label={group.groupLabel} />
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <NavLink
                      key={item.href}
                      {...item}
                      active={active}
                      onClose={onClose}
                    />
                  );
                })}
              </div>
            ))
          : flatLinks?.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink
                  key={item.href}
                  {...item}
                  active={active}
                  onClose={onClose}
                />
              );
            })}
      </nav>
    </aside>
  );
}
