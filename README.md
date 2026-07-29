# SusuFlow

**Eliminate fraud in traditional susu collection systems.**

SusuFlow is a production-grade, multi-tenant fintech SaaS platform that enables susu companies to digitize savings collection. Customers deposit directly via Mobile Money and payment gateways — funds never pass through collectors' hands, eliminating skimming fraud while preserving collector jobs as cashless onboarding agents.

## Mission

> Allow customers to deposit directly into a centralized digital account rather than handing cash to collectors. Every transaction is gateway-confirmed, ledger-recorded, and audit-trailed.

## Documentation Master Index (20 Technical Specifications)

| Phase | Document                                                                                | Description                                                                      | Status       |
| :---- | :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :----------- |
| 1     | [Product Requirements (PRD)](docs/01-PRD.md)                                            | Full PRD, core user flows, & functional specs                                    | **Complete** |
| 2     | [Business Requirements (BRD)](docs/02-BRD.md)                                           | Business goals, compliance, & financial model                                    | **Complete** |
| 3     | [System Architecture](docs/03-system-architecture.md)                                   | Monorepo design, double-entry ledger & NestJS                                    | **Complete** |
| 4     | [Database Architecture](docs/04-database-architecture.md)                               | PostgreSQL schema, RLS, & ledger tables                                          | **Complete** |
| 5     | [API Specifications](docs/05-api-specifications.md)                                     | OpenAPI / Swagger REST API endpoints                                             | **Complete** |
| 6     | [UI/UX Design](docs/06-ui-ux-design.md)                                                 | Design system, glassmorphism, & branding                                         | **Complete** |
| 7     | [Folder Structure](docs/07-folder-structure.md)                                         | Monorepo layout & package organization                                           | **Complete** |
| 8     | [Backend Engineering Spec](docs/08-BACKEND_ENGINEERING_AND_NESTJS_ARCHITECTURE.md)      | NestJS micro-kernel, guards, ORM & BullMQ                                        | **Complete** |
| 9     | [Frontend Engineering Spec](docs/09-FRONTEND_ENGINEERING_AND_NEXTJS_ARCHITECTURE.md)    | Next.js 15 App Router, Zustand & React Query                                     | **Complete** |
| 10    | [Testing Suite](docs/10-testing.md)                                                     | Unit tests, integration tests, & e2e setup                                       | **Complete** |
| 11    | [Security Audit](docs/11-security-audit.md)                                             | Cryptography, RBAC, PII encryption & security                                    | **Complete** |
| 12    | [Performance Optimization](docs/12-performance.md)                                      | Caching, Redis queues, & query tuning                                            | **Complete** |
| 13    | [CI/CD Pipeline](docs/13-cicd.md)                                                       | GitHub Actions, automated builds & deploys                                       | **Complete** |
| 14    | [Deployment Guide](docs/14-deployment.md)                                               | Production Docker, Kubernetes & AWS EKS                                          | **Complete** |
| 15    | [Load Testing](docs/15-load-testing.md)                                                 | Stress testing, concurrency & throughput                                         | **Complete** |
| 16    | [Production Readiness](docs/16-production-readiness.md)                                 | Pre-flight checklist & operational runbooks                                      | **Complete** |
| 17    | [Regulatory & Audit Dossier](docs/17-REGULATORY_COMPLIANCE_AND_AUDIT_SPECIFICATION.md)  | **BoG Act 987 / DPC Act 843 Regulatory Submission**                              | **Complete** |
| 18    | [General Ledger Manual](docs/18-FINANCIAL_LEDGER_AND_DOUBLE_ENTRY_OPERATIONS_MANUAL.md) | Double-entry accounting, COA & balance engine                                    | **Complete** |
| 19    | [Geofence & Offline Guide](docs/19-FIELD_COLLECTOR_GEOFENCE_AND_OFFLINE_SYNC_GUIDE.md)  | Collector GPS verification (<15m) & IndexedDB queue                              | **Complete** |
| 20    | [Operational Runbook](docs/20-OPERATIONAL_RUNBOOK_AND_DISASTER_RECOVERY.md)             | Incident response, gateway failover & DB recovery                                | **Complete** |
| 21    | [Page-by-Page User Guide](docs/21-PORTAL_AND_PAGE_BY_PAGE_USER_GUIDE.md)                | **Exhaustive page-by-page guide for Staff, Admin, Customer & Collector portals** | **Complete** |
| 22    | [Render Deployment Guide](docs/22-RENDER_DEPLOYMENT_GUIDE.md)                           | **1-Click Render.com Blueprint deployment guide (render.yaml)**                  | **Complete** |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL and Redis)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis
pnpm docker:up

# Generate Prisma client and run migrations
pnpm db:generate
pnpm --filter @susuflow/database exec prisma db push

# Seed demo data
pnpm db:seed

# Start API (port 4000) and worker
pnpm --filter @susuflow/api dev
pnpm --filter @susuflow/worker dev

# Start frontend (port 3000)
pnpm dev:web

# Start mobile app (Expo / React Native)
pnpm dev:mobile          # Standard dev server
pnpm dev:mobile:tunnel   # Tunnel mode for physical iOS & Android phones
```

### Frontend Routes

| Portal    | Routes                                                               | Roles                          |
| --------- | -------------------------------------------------------------------- | ------------------------------ |
| Customer  | `/dashboard`, `/deposit`, `/transactions`, `/profile`                | customer                       |
| Staff     | `/staff/dashboard`, `/staff/customers`, `/staff/deposits`            | company_admin, account_officer |
| Collector | `/collector/dashboard`, `/collector/customers`, `/collector/deposit` | collector                      |
| Auth      | `/login`, `/register`                                                | public                         |

### API Documentation

Once running, Swagger docs are at: http://localhost:4000/api/docs

### Demo Credentials (after seed)

| Role          | Email                | Password        | Tenant Header          |
| ------------- | -------------------- | --------------- | ---------------------- |
| Super Admin   | admin@susuflow.com   | ChangeMe123!    | —                      |
| Company Admin | steveamoah@gmail.com | Adipa123!@#     | `x-tenant-slug: adipa` |
| Collector     | nana@adipa.com       | Collector123!@# | `x-tenant-slug: adipa` |

### Key API Endpoints

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | `/api/v1/auth/login`      | Login                 |
| POST   | `/api/v1/auth/register`   | Customer registration |
| POST   | `/api/v1/deposits`        | Initiate deposit      |
| POST   | `/api/v1/webhooks/hubtel` | Payment webhook       |
| GET    | `/api/v1/health`          | Health check          |

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, TailwindCSS, ShadCN, React Query, Zustand
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL 16 with Row-Level Security
- **Cache/Queue:** Redis, BullMQ
- **Payments:** Hubtel (MoMo), Paystack (Cards)
- **Infrastructure:** Docker, Kubernetes (EKS), Terraform, GitHub Actions
- **Cloud:** AWS

## MVP Roadmap

- **Phase 1:** Auth, Tenants, Customers, Wallets, Deposits, Ledger, Dashboard
- **Phase 2:** Withdrawals, Notifications, Reports, KYC
- **Phase 3:** Fraud Detection, AI Insights, Advanced Analytics
- **Phase 4:** Enterprise Features, Open Banking, API Marketplace

## Hybrid Collector Model

Collectors remain in the system but operate **cashlessly**:

- Onboard customers in the field
- Assist customers to initiate MoMo deposits
- Customer confirms payment on their own device
- Collector earns commission on verified deposits only
- Zero opportunity to skim funds

## License

Proprietary. All rights reserved.
