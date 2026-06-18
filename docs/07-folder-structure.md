# SusuFlow — Project Folder Structure

**Version:** 1.0.0  
**Date:** June 18, 2026

---

## Monorepo Structure (Turborepo + pnpm)

```
susuflow/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, test, build on PR
│   │   ├── deploy-staging.yml        # Deploy to staging on merge to develop
│   │   ├── deploy-production.yml     # Deploy to production on tag
│   │   └── security-scan.yml         # SAST, dependency audit
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   └── local.strategy.ts
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   │   └── mfa.guard.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── login.dto.ts
│   │   │   │   │       ├── register.dto.ts
│   │   │   │   │       └── mfa-verify.dto.ts
│   │   │   │   ├── tenant/
│   │   │   │   ├── user/
│   │   │   │   ├── customer/
│   │   │   │   ├── collector/
│   │   │   │   ├── wallet/
│   │   │   │   ├── deposit/
│   │   │   │   ├── withdrawal/
│   │   │   │   ├── ledger/
│   │   │   │   ├── payment/
│   │   │   │   │   ├── gateways/
│   │   │   │   │   │   ├── hubtel.gateway.ts
│   │   │   │   │   │   ├── paystack.gateway.ts
│   │   │   │   │   │   └── payment-gateway.interface.ts
│   │   │   │   │   └── webhooks/
│   │   │   │   │       ├── hubtel.webhook.ts
│   │   │   │   │       └── paystack.webhook.ts
│   │   │   │   ├── notification/
│   │   │   │   ├── receipt/
│   │   │   │   ├── audit/
│   │   │   │   ├── fraud/
│   │   │   │   ├── report/
│   │   │   │   ├── kyc/
│   │   │   │   ├── subscription/
│   │   │   │   └── health/
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── tenant.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── rate-limit.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── audit.interceptor.ts
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── tenant.decorator.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── audit.decorator.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── tenant.middleware.ts
│   │   │   │   │   └── request-id.middleware.ts
│   │   │   │   └── pipes/
│   │   │   │       └── validation.pipe.ts
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── payment.config.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                          # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── register/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   ├── verify-email/page.tsx
│   │   │   │   │   ├── verify-phone/page.tsx
│   │   │   │   │   └── mfa/page.tsx
│   │   │   │   ├── (customer)/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── deposit/page.tsx
│   │   │   │   │   ├── withdraw/page.tsx
│   │   │   │   │   ├── transactions/page.tsx
│   │   │   │   │   ├── statements/page.tsx
│   │   │   │   │   └── profile/page.tsx
│   │   │   │   ├── (staff)/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── customers/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── transactions/page.tsx
│   │   │   │   │   ├── withdrawals/page.tsx
│   │   │   │   │   ├── reports/page.tsx
│   │   │   │   │   ├── staff/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── audit/page.tsx
│   │   │   │   ├── (collector)/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── customers/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── deposit/page.tsx
│   │   │   │   │   └── commissions/page.tsx
│   │   │   │   ├── (admin)/
│   │   │   │   │   ├── tenants/page.tsx
│   │   │   │   │   ├── subscriptions/page.tsx
│   │   │   │   │   ├── system-health/page.tsx
│   │   │   │   │   └── fraud-alerts/page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globals.css
│   │   │   │   └── middleware.ts         # Tenant resolution, auth
│   │   │   ├── components/
│   │   │   │   ├── ui/                     # ShadCN components
│   │   │   │   ├── layout/
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── bottom-nav.tsx
│   │   │   │   │   └── tenant-branding.tsx
│   │   │   │   ├── financial/
│   │   │   │   │   ├── money-display.tsx
│   │   │   │   │   ├── transaction-row.tsx
│   │   │   │   │   ├── balance-card.tsx
│   │   │   │   │   ├── deposit-flow.tsx
│   │   │   │   │   ├── receipt-preview.tsx
│   │   │   │   │   └── status-badge.tsx
│   │   │   │   ├── forms/
│   │   │   │   │   ├── phone-input.tsx
│   │   │   │   │   ├── ghana-card-input.tsx
│   │   │   │   │   └── amount-input.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── stat-card.tsx
│   │   │   │       ├── recent-transactions.tsx
│   │   │   │       └── deposits-chart.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                  # API client (axios/fetch)
│   │   │   │   ├── auth.ts                 # Auth helpers
│   │   │   │   ├── utils.ts                # cn(), formatters
│   │   │   │   └── constants.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-tenant.ts
│   │   │   │   ├── use-deposits.ts
│   │   │   │   └── use-balance.ts
│   │   │   └── stores/
│   │   │       ├── auth.store.ts             # Zustand
│   │   │       └── ui.store.ts
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── images/
│   │   ├── Dockerfile
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── worker/                       # BullMQ Background Workers
│       ├── src/
│       │   ├── processors/
│       │   │   ├── receipt.processor.ts
│       │   │   ├── notification.processor.ts
│       │   │   ├── fraud.processor.ts
│       │   │   └── audit.processor.ts
│       │   ├── queues/
│       │   │   └── queue.module.ts
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma + Migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts              # Prisma client export
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                       # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── tenant.types.ts
│   │   │   │   ├── customer.types.ts
│   │   │   │   ├── transaction.types.ts
│   │   │   │   └── api.types.ts
│   │   │   ├── constants/
│   │   │   │   ├── roles.ts
│   │   │   │   ├── permissions.ts
│   │   │   │   └── error-codes.ts
│   │   │   ├── validators/
│   │   │   │   ├── phone.validator.ts
│   │   │   │   ├── ghana-card.validator.ts
│   │   │   │   └── amount.validator.ts
│   │   │   └── utils/
│   │   │       ├── currency.ts
│   │   │       ├── reference.ts
│   │   │       └── idempotency.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── jest/
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml        # Local development
│   │   ├── docker-compose.test.yml
│   │   └── init-scripts/
│   │       └── 01-init-db.sql
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── api-deployment.yaml
│   │   │   ├── web-deployment.yaml
│   │   │   ├── worker-deployment.yaml
│   │   │   ├── services.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── configmap.yaml
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   └── production/
│   │       └── kustomization.yaml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── modules/
│       │   ├── vpc/
│       │   ├── eks/
│       │   ├── rds/
│       │   ├── elasticache/
│       │   └── s3/
│       └── environments/
│           ├── staging/
│           └── production/
│
├── docs/                             # Documentation (this folder)
│   ├── 01-PRD.md
│   ├── 02-BRD.md
│   ├── 03-system-architecture.md
│   ├── 04-database-architecture.md
│   ├── 05-api-specifications.md
│   ├── 06-ui-ux-design.md
│   └── 07-folder-structure.md
│
├── scripts/
│   ├── setup.sh                      # First-time dev setup
│   ├── seed-dev.sh                   # Seed development data
│   └── generate-migration.sh
│
├── .env.example
├── .gitignore
├── .nvmrc
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## Key Configuration Files

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["build"] },
    "test:e2e": { "dependsOn": ["build"] }
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

*Document end. Ready for backend and frontend development.*
