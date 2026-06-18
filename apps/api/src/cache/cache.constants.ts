export const TENANT_CACHE_PREFIX = 'tenant:slug:';
export const TENANT_CACHE_TTL_SECONDS = parseInt(
  process.env.TENANT_CACHE_TTL_SECONDS || '300',
  10,
);
