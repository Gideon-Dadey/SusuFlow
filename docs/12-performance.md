# SusuFlow — Performance Optimization

**Phase:** 12  
**Date:** June 2026

## Performance Targets (from PRD)

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Deposit confirmation processing | < 5 seconds |
| Dashboard load time | < 2 seconds |
| Concurrent users per tenant | 10,000 |
| Platform throughput | 500 TPS |

---

## 1. Backend Optimizations

### 1.1 Redis Tenant Cache

Every authenticated request resolves tenant context via `TenantMiddleware`. Tenant lookups are cached in Redis to avoid a database round-trip on every request.

| Setting | Value |
|---------|-------|
| Key pattern | `tenant:slug:{slug}` |
| TTL | 300s (configurable via `TENANT_CACHE_TTL_SECONDS`) |
| Fallback | Direct DB query if Redis unavailable |

**Files:** `apps/api/src/cache/`, `apps/api/src/common/middleware/tenant.middleware.ts`

### 1.2 Structured Logging (Pino)

Replaced `console.log` with `nestjs-pino` for JSON structured logs in production and pretty-printed logs in development.

| Feature | Detail |
|---------|--------|
| Request logging | Method, URL, status, duration |
| Health/docs | Excluded from auto-logging |
| Redaction | `Authorization` and `Cookie` headers |
| Config | `LOG_LEVEL` env var |

**Files:** `apps/api/src/config/logger.config.ts`, `apps/api/src/main.ts`

### 1.3 Response Compression

Gzip compression enabled via `compression` middleware for JSON API responses.

### 1.4 Ledger Balance Aggregation

`LedgerService.getAccountBalance()` uses Prisma `groupBy` with `_sum` instead of loading all ledger entries into memory. This scales with account activity without O(n) memory growth.

### 1.5 Query Selectivity

Customer list endpoint returns selective wallet fields (`id`, `status`, `walletType`, `currency`) instead of full wallet relations with nested accounts.

### 1.6 Prisma Logging

Development: `warn` and `error` only. Production: `error` only. Avoids query log noise in hot paths.

---

## 2. Frontend Optimizations

### 2.1 React Query Defaults

| Setting | Value | Rationale |
|---------|-------|-----------|
| `staleTime` | 60s | Reduce redundant dashboard fetches |
| `gcTime` | 5 min | Keep cached data for back-navigation |
| `refetchOnWindowFocus` | false | Avoid burst refetches on tab switch |

### 2.2 Next.js Config

- `compress: true` — gzip for static assets
- `poweredByHeader: false` — remove `X-Powered-By`
- AVIF/WebP image formats for optimized media delivery

---

## 3. Health & Observability

`GET /api/v1/health` now reports:

```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

- **Database down** → overall status `degraded`
- **Redis down** → API remains operational (cache miss fallback); `checks.redis` = `unhealthy`

---

## 4. Database Indexes

Existing Prisma indexes cover hot query paths (verified in Phase 12 review):

| Table | Index | Use case |
|-------|-------|----------|
| `tenants` | `slug` (unique) | Tenant resolution |
| `customers` | `tenantId`, `collectorId`, `status` | List/filter |
| `transactions` | `tenantId`, `createdAt DESC` | Transaction history |
| `ledger_entries` | `accountId`, `createdAt DESC` | Balance aggregation |

**Future:** Materialized balance column on `accounts` table when ledger volume exceeds 100K entries per account.

---

## 5. Caching Strategy (Roadmap)

| Layer | Phase 12 | Phase 13+ |
|-------|----------|-----------|
| Tenant slug lookup | ✅ Redis | — |
| JWT validation | DB per request | Redis session cache |
| Account balances | DB aggregation | Redis with write-through |
| Dashboard stats | — | Redis + background refresh |
| CDN static assets | — | CloudFront |

---

## 6. Load Testing

See [Phase 15 Load Testing](15-load-testing.md) for k6 scripts and run instructions.

---

## 7. Environment Variables

```bash
TENANT_CACHE_TTL_SECONDS=300   # Tenant cache TTL
LOG_LEVEL=info                   # Pino log level
REDIS_URL=redis://localhost:6379
```

---

## 8. Sign-Off

| Optimization | Status |
|--------------|--------|
| Redis tenant cache | ✅ |
| Pino structured logging | ✅ |
| Gzip compression | ✅ |
| Ledger aggregation query | ✅ |
| Customer list selectivity | ✅ |
| React Query tuning | ✅ |
| Health Redis check | ✅ |
| Materialized balances | ⏳ Phase 13+ |
| Read replicas | ⏳ Phase 14 |
| CDN | ⏳ Phase 14 |

---

*Next: Phase 14 — Deployment (Terraform, EKS) → `14-deployment.md`*
