# SusuFlow Web

Next.js 15 App Router — role portals, auth, and public marketing.

## Quick start

```bash
# From repo root (API + Redis/Postgres should be running)
pnpm install
pnpm dev:web   # http://localhost:3000
```

## Surfaces

| Area      | Routes           | Notes                                                  |
| --------- | ---------------- | ------------------------------------------------------ |
| Marketing | `/(marketing)/*` | OmniH-inspired photo heroes, glass cards, floating nav |
| Customer  | `/(customer)/*`  | Web savings portal                                     |
| Staff     | `/(staff)/*`     | Operations, withdrawals, ledger                        |
| Collector | `/(collector)/*` | Field deposits + geofence                              |
| Admin     | `/(admin)/*`     | Multi-tenant platform                                  |
| Auth      | `/(auth)/*`      | Login / register / verify                              |

Marketing components live under `src/components/marketing/` (`photo-hero`, `glass-card`, `vision-quote-section`, etc.). Do not reuse marketing atmosphere tokens for the native Expo customer app — see [`docs/06-ui-ux-design.md`](../../docs/06-ui-ux-design.md) and [`docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md`](../../docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md).

## Docs

- [`docs/09-FRONTEND_ENGINEERING_AND_NEXTJS_ARCHITECTURE.md`](../../docs/09-FRONTEND_ENGINEERING_AND_NEXTJS_ARCHITECTURE.md)
- [`docs/21-PORTAL_AND_PAGE_BY_PAGE_USER_GUIDE.md`](../../docs/21-PORTAL_AND_PAGE_BY_PAGE_USER_GUIDE.md)
