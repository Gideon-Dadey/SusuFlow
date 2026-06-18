# SusuFlow

**Eliminate fraud in traditional susu collection systems.**

SusuFlow is a production-grade, multi-tenant fintech SaaS platform that enables susu companies to digitize savings collection. Customers deposit directly via Mobile Money and payment gateways — funds never pass through collectors' hands, eliminating skimming fraud while preserving collector jobs as cashless onboarding agents.

## Mission

> Allow customers to deposit directly into a centralized digital account rather than handing cash to collectors. Every transaction is gateway-confirmed, ledger-recorded, and audit-trailed.

## Documentation

| Phase | Document | Status |
|-------|----------|--------|
| 1 | [Product Requirements (PRD)](docs/01-PRD.md) | Complete |
| 2 | [Business Requirements (BRD)](docs/02-BRD.md) | Complete |
| 3 | [System Architecture](docs/03-system-architecture.md) | Complete |
| 4 | [Database Architecture](docs/04-database-architecture.md) | Complete |
| 5 | [API Specifications](docs/05-api-specifications.md) | Complete |
| 6 | [UI/UX Design](docs/06-ui-ux-design.md) | Complete |
| 7 | [Folder Structure](docs/07-folder-structure.md) | Complete |
| 8 | Backend Development | **Complete** |
| 9 | Frontend Development | **Complete** |
| 10 | [Testing](docs/10-testing.md) | **Complete** |
| 11 | [Security Audit](docs/11-security-audit.md) | **Complete** |
| 12 | [Performance Optimization](docs/12-performance.md) | **Complete** |
| 13 | [CI/CD Setup](docs/13-cicd.md) | **Complete** |
| 14 | [Deployment](docs/14-deployment.md) | **Complete** |
| 15 | [Load Testing](docs/15-load-testing.md) | **Complete** |
| 16 | [Production Readiness](docs/16-production-readiness.md) | **Complete** |

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
```

### Frontend Routes

| Portal | Routes | Roles |
|--------|--------|-------|
| Customer | `/dashboard`, `/deposit`, `/transactions`, `/profile` | customer |
| Staff | `/staff/dashboard`, `/staff/customers`, `/staff/deposits` | company_admin, account_officer |
| Collector | `/collector/dashboard`, `/collector/customers`, `/collector/deposit` | collector |
| Auth | `/login`, `/register` | public |

### API Documentation

Once running, Swagger docs are at: http://localhost:4000/api/docs

### Demo Credentials (after seed)

| Role | Email | Password | Tenant Header |
|------|-------|----------|---------------|
| Super Admin | admin@susuflow.com | ChangeMe123! | — |
| Company Admin | admin@abcsusu.com | Admin123!@# | `x-tenant-slug: abc-susu` |
| Collector | nana@abcsusu.com | Collector123!@# | `x-tenant-slug: abc-susu` |

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/register` | Customer registration |
| POST | `/api/v1/deposits` | Initiate deposit |
| POST | `/api/v1/webhooks/hubtel` | Payment webhook |
| GET | `/api/v1/health` | Health check |

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
