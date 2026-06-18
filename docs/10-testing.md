# SusuFlow — Testing Strategy

**Phase:** 10  
**Date:** June 2026

## Test Pyramid

| Layer | Tool | Location | Scope |
|-------|------|----------|-------|
| Unit | Jest / Vitest | `**/*.spec.ts`, `**/*.test.ts` | Business logic, validators, guards |
| Integration | Jest + Supertest | `apps/api/test/*.e2e-spec.ts` | HTTP API, auth, validation |
| E2E | Supertest (API), Playwright (future) | `apps/api/test/` | Full request flows |
| Security | Jest e2e | `security.e2e-spec.ts` | Auth enforcement, public routes |

## Running Tests

```bash
# All unit tests (shared, api, web)
pnpm test

# API unit tests with coverage
pnpm --filter @susuflow/api test:coverage

# Shared package with 90% threshold
pnpm --filter @susuflow/shared test:coverage

# API integration / security e2e
pnpm test:e2e

# Web unit tests
pnpm --filter @susuflow/web test
```

## Coverage Targets

| Package | Target | Focus |
|---------|--------|-------|
| `@susuflow/shared` | 90%+ | Validators, currency, references |
| `@susuflow/api` | Critical paths | Ledger, auth, guards, payment gateway |
| `@susuflow/web` | Utils + routing | formatGhs, role-based redirects |

## What's Tested

### Unit
- Double-entry ledger balance and imbalance rejection
- Auth login, lockout, logout
- RBAC roles guard
- JWT auth guard (public vs protected)
- Hubtel webhook signature verification
- Ghana phone/card validators
- Currency formatting and parsing

### Integration / Security E2E
- Health endpoints (live, ready)
- Protected routes return 401 without JWT
- Public routes accessible without auth
- Input validation on auth DTOs
- Webhook endpoint accessible without JWT

## CI

GitHub Actions runs `pnpm test` and `pnpm test:e2e` on every PR.

## Future (Phase 10+)

- Playwright browser E2E for deposit flow UI
- Database integration tests with testcontainers
- Load tests with k6 (Phase 15)
