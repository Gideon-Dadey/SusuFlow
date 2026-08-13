# SusuFlow API

NestJS REST API (`/api/v1`) for auth, tenants, customers, deposits, withdrawals, ledger, payments, and KYC.

## Quick start

```bash
# From repo root
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm --filter @susuflow/database exec prisma db push
pnpm db:seed
pnpm --filter @susuflow/api dev   # http://localhost:4000
```

Swagger (non-production): http://localhost:4000/api/docs

## Key money endpoints

| Method | Path                       | Notes                                                                |
| ------ | -------------------------- | -------------------------------------------------------------------- |
| `POST` | `/deposits`                | Optional `idempotencyKey`                                            |
| `POST` | `/withdrawals/request`     | Customer self-serve; optional `idempotencyKey` (mobile always sends) |
| `POST` | `/withdrawals`             | Staff-recorded withdrawal                                            |
| `POST` | `/withdrawals/:id/approve` | Staff approval                                                       |
| `POST` | `/webhooks/hubtel`         | Signature-verified                                                   |

Idempotency: same key + same intent returns the original transaction; conflicting reuse → `409`.

## Docs

- [`docs/05-api-specifications.md`](../../docs/05-api-specifications.md)
- [`docs/08-BACKEND_ENGINEERING_AND_NESTJS_ARCHITECTURE.md`](../../docs/08-BACKEND_ENGINEERING_AND_NESTJS_ARCHITECTURE.md)
- [`docs/11-security-audit.md`](../../docs/11-security-audit.md)
