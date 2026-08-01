const EMAIL_DOMAIN_TENANT_SLUG: Record<string, string> = {
  "susuflow.com": "adipa",
  "adipa.com": "adipa",
};

const PLATFORM_EMAIL_DOMAINS = new Set(["susuflow.com", "susuflow.com"]);

function isPlatformEmailDomain(domain: string): boolean {
  if (PLATFORM_EMAIL_DOMAINS.has(domain)) return true;
  return domain.endsWith(".susuflow.com") || domain.endsWith(".susuflow.com");
}

export function inferTenantSlugFromEmail(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return "";

  if (isPlatformEmailDomain(domain)) return "";
  if (EMAIL_DOMAIN_TENANT_SLUG[domain]) return EMAIL_DOMAIN_TENANT_SLUG[domain];

  const hostPart = domain.split(".")[0];
  const susuMatch = hostPart.match(/^(.+?)susu$/);
  if (susuMatch?.[1]) return `${susuMatch[1]}-susu`;

  return "";
}

export function resolveLoginTenantSlug(
  email: string,
  explicit?: string,
  storedSlug?: string,
): string {
  if (
    explicit?.trim() &&
    explicit.trim() !== "apex-susu" &&
    explicit.trim() !== "abc-susu"
  ) {
    return explicit.trim();
  }

  const inferred = inferTenantSlugFromEmail(email);
  if (inferred) return inferred;

  return "";
}
