import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGhs(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safe = Number.isFinite(num) ? num : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `₵${formatted}`;
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

/** Map known company email domains to tenant slugs. */
const EMAIL_DOMAIN_TENANT_SLUG: Record<string, string> = {
  "apexsusu.com": "apex-susu",
};

/** Platform operator domains — no tenant context on login. */
const PLATFORM_EMAIL_DOMAINS = new Set(["susuflow.com"]);

function isPlatformEmailDomain(domain: string): boolean {
  if (PLATFORM_EMAIL_DOMAINS.has(domain)) return true;
  // e.g. customer-000003@temp.susuflow.com — tenant comes from URL/storage, not email
  return domain.endsWith(".susuflow.com");
}

export function inferTenantSlugFromEmail(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return "";

  if (isPlatformEmailDomain(domain)) return "";

  if (EMAIL_DOMAIN_TENANT_SLUG[domain]) {
    return EMAIL_DOMAIN_TENANT_SLUG[domain];
  }

  const hostPart = domain.split(".")[0];
  const susuMatch = hostPart.match(/^(.+?)susu$/);
  if (susuMatch?.[1]) {
    return `${susuMatch[1]}-susu`;
  }

  return "";
}

export function resolveLoginTenantSlug(
  email: string,
  explicit?: string,
): string {
  if (explicit?.trim()) return explicit.trim();

  const inferred = inferTenantSlugFromEmail(email);
  if (inferred) return inferred;

  if (typeof window !== "undefined") {
    const fromQuery = new URLSearchParams(window.location.search).get("tenant");
    if (fromQuery?.trim()) return fromQuery.trim();

    const stored = localStorage.getItem("tenant_slug")?.trim();
    if (stored && stored !== "abc-susu") return stored;
  }

  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim();
  if (envDefault && envDefault !== "abc-susu") return envDefault;

  return "";
}

export function getTenantSlug(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim() || "";
  }
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery) return fromQuery;
  const stored = localStorage.getItem("tenant_slug");
  if (stored) return stored;
  const host = window.location.hostname;
  if (host.includes(".") && !host.startsWith("localhost")) {
    return host.split(".")[0];
  }
  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim();
  return envDefault && envDefault !== "abc-susu" ? envDefault : "";
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
