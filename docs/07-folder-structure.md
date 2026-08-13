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
│   │   │   ├── modules/              # auth, tenant, customer, deposit, withdrawal,
│   │   │   │                         # ledger, payment, notification, kyc, audit, …
│   │   │   ├── common/               # guards, filters, middleware, notifications
│   │   │   ├── config/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web/                          # Next.js 15 — portals + marketing
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (marketing)/      # Public marketing (OmniH-style photo/glass)
│   │   │   │   ├── (customer)/
│   │   │   │   ├── (staff)/
│   │   │   │   ├── (collector)/
│   │   │   │   └── (admin)/
│   │   │   ├── components/
│   │   │   │   └── marketing/        # photo-hero, glass-card, vision-quote, …
│   │   │   └── lib/
│   │   └── package.json
│   │
│   ├── mobile/                       # Expo customer app (iOS / Android)
│   │   ├── app/                      # Expo Router: (auth), (tabs), support, my-profile
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── lib/                  # api, config, monitoring, analytics, support-assistant
│   │   │   ├── stores/               # auth, theme, app-lock, toast
│   │   │   └── hooks/                # useMoneyStepUp, useNetworkStatus
│   │   ├── eas.json
│   │   ├── app.json
│   │   ├── README.md
│   │   └── package.json
│   │
│   └── worker/                       # BullMQ worker (push, notifications, email/SMS)
│       ├── src/
│       │   ├── processors/
│       │   ├── queues/
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

_Document end. Includes `apps/mobile`, marketing web surfaces, and worker._
