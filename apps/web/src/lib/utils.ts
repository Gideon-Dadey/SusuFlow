import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGhs(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(num || 0);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

export type PortalVariant = "admin" | "staff" | "collector" | "customer";

export function getPortalFromPathname(pathname: string): PortalVariant {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/collector")) return "collector";
  return "customer";
}

export function getProfilePathForPortal(
  portal: PortalVariant,
  roles: string[],
): string {
  switch (portal) {
    case "admin":
      return "/admin/profile";
    case "staff":
      return getProfilePath(roles);
    case "collector":
      return "/collector/profile";
    default:
      return "/profile";
  }
}

export function getRoleLabelForPortal(
  portal: PortalVariant,
  roles: string[],
): string {
  if (portal === "collector") return "Collector account";
  if (portal === "admin") return "Super Admin account";
  if (portal === "staff") {
    if (roles.includes("company_admin")) return "Company Admin account";
    if (roles.includes("account_officer")) return "Account Officer account";
    if (roles.includes("auditor")) return "Auditor account";
    return "Staff account";
  }
  return "Customer account";
}

export function getTenantSlug(): string {
  if (typeof window === "undefined") return "abc-susu";
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery) return fromQuery;
  const stored = localStorage.getItem("tenant_slug");
  if (stored) return stored;
  const host = window.location.hostname;
  if (host.includes(".") && !host.startsWith("localhost")) {
    return host.split(".")[0];
  }
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || "abc-susu";
}

export function getDashboardPath(roles: string[]): string {
  if (roles.includes("super_admin")) return "/admin/dashboard";
  if (
    roles.includes("company_admin") ||
    roles.includes("account_officer") ||
    roles.includes("auditor")
  ) {
    return "/staff/dashboard";
  }
  if (roles.includes("collector")) return "/collector/dashboard";
  return "/dashboard";
}

export function getProfilePath(roles: string[]): string {
  if (roles.includes("super_admin")) return "/admin/profile";
  if (roles.includes("company_admin") || roles.includes("account_officer"))
    return "/staff/settings";
  if (roles.includes("collector")) return "/collector/profile";
  return "/profile";
}
