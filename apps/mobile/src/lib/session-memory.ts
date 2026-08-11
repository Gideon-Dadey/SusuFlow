let accessToken: string | null = null;
let tenantSlug = "";

export function rememberSession(next: {
  accessToken?: string | null;
  tenantSlug?: string;
}) {
  if ("accessToken" in next) {
    accessToken = next.accessToken ?? null;
  }
  if ("tenantSlug" in next) {
    tenantSlug = next.tenantSlug ?? "";
  }
}

export function rememberedAccessToken() {
  return accessToken;
}

export function rememberedTenantSlug() {
  return tenantSlug;
}

export function clearRememberedSession() {
  accessToken = null;
  tenantSlug = "";
}
