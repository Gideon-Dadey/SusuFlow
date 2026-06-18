# SusuFlow — System Architecture Document

**Version:** 1.0.0  
**Status:** Draft → Review  
**Date:** June 18, 2026  
**Depends on:** [01-PRD.md](./01-PRD.md), [02-BRD.md](./02-BRD.md)

---

## 1. Architecture Overview

SusuFlow follows a **modular monolith** architecture for MVP (Phase 1–2), designed for **strangler-fig extraction** into microservices as scale demands (Phase 3+). This balances development velocity with enterprise-grade separation of concerns.

### 1.1 Architecture Principles

1. **Tenant isolation first** — every data access is tenant-scoped
2. **Immutable financial records** — ledger entries are append-only
3. **Gateway-confirmed deposits** — payment provider is source of truth
4. **Audit everything** — all state changes produce audit events
5. **Fail secure** — deny by default; explicit grants only
6. **Event-driven async** — notifications, receipts, webhooks via queues
7. **API-first** — all UI interactions via versioned REST APIs

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Customer │  │  Staff   │  │ Collector│  │  Super   │               │
│  │  Portal  │  │  Portal  │  │   App    │  │  Admin   │               │
│  │ (Next.js)│  │ (Next.js)│  │ (Next.js)│  │ (Next.js)│               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
└───────┼──────────────┼──────────────┼──────────────┼─────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CDN (CloudFront) + WAF                              │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────┐
│                     NGINX Ingress Controller                          │
│              (TLS termination, rate limiting, routing)                │
│                                                                         │
│  abc.susuflow.com ──► Tenant Router (subdomain → tenant_id)          │
│  api.susuflow.com  ──► API Gateway                                     │
│  admin.susuflow.com ──► Super Admin Portal                             │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Next.js    │  │   NestJS API     │  │  Webhook Handler │
│   Frontend   │  │   (Modular       │  │  (Payment        │
│   (SSR/SSG)  │  │    Monolith)     │  │   Callbacks)     │
└──────────────┘  └────────┬─────────┘  └────────┬─────────┘
                           │                      │
              ┌────────────┼──────────────────────┤
              ▼            ▼                      ▼
┌──────────────────┐ ┌──────────┐  ┌──────────────────────────┐
│   PostgreSQL     │ │  Redis   │  │      BullMQ Workers      │
│   (Primary +     │ │ (Cache,  │  │  ┌────────┐ ┌─────────┐ │
│    Read Replica) │ │  Session,│  │  │Receipt │ │ Notify  │ │
│                  │ │  Rate    │  │  │Worker  │ │ Worker  │ │
│                  │ │  Limit)  │  │  └────────┘ └─────────┘ │
└──────────────────┘ └──────────┘  │  ┌────────┐ ┌─────────┐ │
                                     │  │ Fraud  │ │ Audit   │ │
                                     │  │Worker  │ │ Worker  │ │
                                     │  └────────┘ └─────────┘ │
                                     └──────────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────┐
              ▼               ▼               ▼               ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  AWS S3  │  │ Hubtel   │  │ Paystack │  │ SendGrid │
        │ (Docs,   │  │ (MoMo)   │  │ (Cards)  │  │ (Email)  │
        │ Receipts)│  │          │  │          │  │          │
        └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend (Next.js 15)

| Module | Route Group | Users |
|--------|------------|-------|
| Customer Portal | `(customer)/` | Customers |
| Staff Portal | `(staff)/` | Account Officers, Company Admins |
| Collector Portal | `(collector)/` | Collectors |
| Super Admin | `(admin)/` | Platform operators |
| Auth | `(auth)/` | All (login, register, MFA) |

**Key patterns:**
- App Router with Server Components for SEO and performance
- React Query for server state management
- Zustand for client UI state (modals, sidebar, theme)
- ShadCN/UI component library with TailwindCSS
- Subdomain-based tenant resolution via middleware
- Role-based route guards

### 2.2 Backend (NestJS Modular Monolith)

```
apps/api/src/
├── modules/
│   ├── auth/              # JWT, MFA, OAuth, sessions
│   ├── tenant/            # Multi-tenancy, subdomain resolution
│   ├── user/              # User management, RBAC
│   ├── customer/          # Customer CRUD, onboarding
│   ├── collector/         # Collector management, commissions
│   ├── wallet/            # Wallet and account management
│   ├── deposit/           # Deposit initiation and processing
│   ├── withdrawal/        # Withdrawal requests and disbursement
│   ├── ledger/            # Double-entry accounting engine
│   ├── payment/           # Payment gateway abstraction
│   ├── notification/      # Email, SMS, push dispatch
│   ├── receipt/           # PDF receipt generation
│   ├── audit/             # Audit log capture and query
│   ├── fraud/             # Fraud detection rules and alerts
│   ├── report/            # Analytics and report generation
│   ├── kyc/               # KYC verification workflows
│   ├── subscription/      # SaaS billing and plans
│   └── health/            # Health checks and metrics
├── common/
│   ├── guards/            # Auth, tenant, role, rate-limit guards
│   ├── interceptors/      # Audit, transform, logging
│   ├── filters/           # Exception handling
│   ├── decorators/        # @Tenant(), @Roles(), @Audit()
│   ├── middleware/         # Tenant resolution, request ID
│   └── pipes/             # Validation pipes
├── config/                # Environment configuration
└── main.ts                # Bootstrap, Swagger, global pipes
```

### 2.3 Payment Gateway Abstraction

```typescript
interface PaymentGateway {
  initiatePayment(params: InitiatePaymentDto): Promise<PaymentSession>;
  verifyWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;
  disburseFunds(params: DisbursementDto): Promise<DisbursementResult>;
  checkStatus(reference: string): Promise<PaymentStatus>;
}

// Implementations:
// - HubtelGateway (MTN MoMo, Telecel, AirtelTigo)
// - PaystackGateway (Cards, bank transfer)
// - FlutterwaveGateway (backup)
```

### 2.4 Ledger Engine

The ledger is the **financial source of truth**. No balance is stored as a mutable field — all balances are derived from ledger entries.

```
Transaction Event (e.g., deposit confirmed)
    │
    ▼
LedgerService.postEntries([
  { account: '1000-platform-cash',  type: 'DEBIT',  amount: 100.00 },
  { account: '1100-customer-wallet-{id}', type: 'CREDIT', amount: 100.00 },
])
    │
    ▼
Validation:
  ✓ Debits == Credits
  ✓ Accounts exist and belong to tenant
  ✓ Idempotency key not duplicate
    │
    ▼
INSERT INTO ledger_entries (immutable)
    │
    ▼
Emit event: 'ledger.entry.created'
    │
    ▼
Workers: receipt, notification, fraud check
```

---

## 3. Multi-Tenancy Architecture

### 3.1 Tenant Resolution

```
Request: https://abc.susuflow.com/api/v1/deposits
    │
    ▼
NGINX → extracts subdomain "abc"
    │
    ▼
TenantMiddleware:
  1. Lookup tenant by slug "abc" (cached in Redis)
  2. Attach tenant_id to request context
  3. Reject if tenant suspended
    │
    ▼
All database queries include: WHERE tenant_id = :tenantId
```

### 3.2 Data Isolation Strategy

| Layer | Strategy |
|-------|----------|
| Database | `tenant_id` column on every table + Row-Level Security (RLS) |
| Cache | Tenant-prefixed Redis keys: `tenant:{id}:...` |
| Storage | S3 prefix per tenant: `s3://susuflow/{tenant_id}/...` |
| Queue | Tenant ID in job payload; workers scope all operations |
| Search | Tenant filter on all queries (no cross-tenant search) |

### 3.3 PostgreSQL Row-Level Security

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON customers
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐
│ Client │────►│  NGINX  │────►│  NestJS  │────►│ Redis  │
│        │     │  (TLS)  │     │  Auth    │     │(session)│
└────────┘     └─────────┘     └──────────┘     └────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Access Token    Refresh Token     MFA Token
              (JWT, 15min)   (opaque, 7d)      (TOTP, 30s)
```

**Token structure (JWT access token):**
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "roles": ["company_admin"],
  "permissions": ["deposit:read", "withdrawal:approve"],
  "device_id": "device-uuid",
  "iat": 1718745600,
  "exp": 1718746500
}
```

### 4.2 Authorization Model

**RBAC (Role-Based):** User → Role → Permissions  
**ABAC (Attribute-Based):** Additional policies based on:
- Resource ownership (collector can only see assigned customers)
- Tenant context (all operations scoped to tenant)
- Transaction amount (high-value requires additional approval)
- KYC level (deposit limits based on verification status)

### 4.3 Security Layers

| Layer | Control |
|-------|---------|
| Network | AWS WAF, security groups, private subnets |
| Transport | TLS 1.3 everywhere |
| Application | Input validation, parameterized queries, CSP headers |
| Authentication | JWT + MFA + device tracking |
| Authorization | RBAC + ABAC guards on every endpoint |
| Data | AES-256 at rest, field-level encryption for PII |
| Audit | Immutable audit log for all state changes |
| Secrets | AWS Secrets Manager, no secrets in code/env files |

---

## 5. Data Flow Diagrams

### 5.1 Deposit Flow (Sequence)

```
Customer     Frontend      API           PaymentGW     Ledger       Queue
   │            │            │               │            │           │
   │──deposit──►│            │               │            │           │
   │            │──POST─────►│               │            │           │
   │            │            │──initiate────►│            │           │
   │            │            │◄──session─────│            │           │
   │            │◄─redirect──│               │            │           │
   │──MoMo PIN─────────────────────────────►│            │           │
   │            │            │               │            │           │
   │            │            │◄──webhook─────│            │           │
   │            │            │──verify────────────────────────────── │
   │            │            │──postEntries──────────────►│           │
   │            │            │◄──confirmed────────────────│           │
   │            │            │──enqueue─────────────────────────────►│
   │            │            │               │            │     receipt
   │            │            │               │            │     notify
   │◄──SMS───────────────────────────────────────────────────────────│
   │            │◄──WS update──────────────│            │           │
```

### 5.2 Audit Flow

```
Any State Change
    │
    ▼
AuditInterceptor (NestJS)
    │
    ├── Capture: user_id, tenant_id, action, resource
    ├── Capture: IP, user_agent, device_id, geo
    ├── Capture: before_state (from DB), after_state (from request)
    ├── Generate: correlation_id
    │
    ▼
AuditService.log() → INSERT audit_logs (append-only)
    │
    ▼
If high-risk action → FraudService.evaluate()
```

---

## 6. Infrastructure Architecture

### 6.1 AWS Services Map

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **EKS** | Kubernetes cluster | 3 node groups (app, worker, monitoring) |
| **RDS PostgreSQL 16** | Primary database | Multi-AZ, db.r6g.large, automated backups |
| **ElastiCache Redis 7** | Cache, sessions, queues | Cluster mode, 3 shards |
| **S3** | File storage | Versioning enabled, lifecycle policies |
| **CloudFront** | CDN | Static assets, API caching |
| **Route 53** | DNS | `*.susuflow.com` wildcard |
| **ACM** | TLS certificates | Auto-renewal |
| **Secrets Manager** | Secrets rotation | 30-day rotation |
| **CloudWatch** | Monitoring | Dashboards, alarms, log groups |
| **WAF** | Web application firewall | OWASP rule set |
| **ECR** | Container registry | Image scanning enabled |

### 6.2 Kubernetes Architecture

```
Namespace: susuflow-production
├── Deployment: api (3 replicas, HPA 3-10)
├── Deployment: frontend (2 replicas)
├── Deployment: worker-receipt (2 replicas)
├── Deployment: worker-notification (2 replicas)
├── Deployment: worker-fraud (1 replica)
├── Deployment: worker-audit (1 replica)
├── Service: api-service (ClusterIP)
├── Service: frontend-service (ClusterIP)
├── Ingress: susuflow-ingress (NGINX)
├── ConfigMap: app-config
├── Secret: app-secrets (from AWS Secrets Manager via CSI)
├── HPA: api-hpa (CPU 70%, memory 80%)
└── PDB: api-pdb (minAvailable: 2)
```

### 6.3 Environment Strategy

| Environment | Purpose | URL |
|------------|---------|-----|
| Development | Local dev | `localhost:3000` / `localhost:4000` |
| Staging | Pre-production testing | `staging.susuflow.com` |
| Production | Live platform | `*.susuflow.com` |

---

## 7. Observability

### 7.1 Logging

- Structured JSON logs (Pino logger)
- Correlation ID on every request
- Log levels: error, warn, info, debug
- Centralized in CloudWatch Logs
- Retention: 90 days (app), 7 years (audit)

### 7.2 Metrics

| Metric | Alert Threshold |
|--------|----------------|
| API latency p95 | > 500ms |
| Error rate (5xx) | > 1% |
| Deposit success rate | < 95% |
| Queue depth | > 1000 jobs |
| Database connections | > 80% pool |
| Memory usage | > 85% |

### 7.3 Tracing

- OpenTelemetry instrumentation
- Distributed tracing across API → workers → external services
- Jaeger for trace visualization

---

## 8. Disaster Recovery

| Scenario | RTO | RPO | Strategy |
|----------|-----|-----|----------|
| Database failure | 4h | 1h | Multi-AZ RDS failover |
| Region outage | 8h | 1h | Cross-region read replica promotion |
| Data corruption | 2h | 1h | Point-in-time recovery |
| Security breach | 1h | 0 | Isolate, rotate secrets, forensic analysis |

**Backup schedule:**
- Database: automated hourly snapshots, 35-day retention
- S3: cross-region replication
- Configuration: GitOps (all infra in Terraform)

---

## 9. Scalability Path

### Phase 1 (MVP): Modular Monolith
- Single NestJS application, all modules
- Single PostgreSQL instance with RLS
- Redis for cache and queues
- Target: 50 tenants, 100K customers

### Phase 2: Read Scaling
- PostgreSQL read replicas for reporting
- Redis cluster mode
- CDN for static assets
- Target: 200 tenants, 500K customers

### Phase 3: Service Extraction
- Extract: Payment Service, Notification Service, Fraud Service
- Event bus (AWS SNS/SQS or Kafka)
- Target: 500 tenants, 2M customers

### Phase 4: Full Microservices
- Independent scaling per service
- Multi-region deployment
- Target: 1000+ tenants, 10M+ customers

---

## 10. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monolith vs Microservices | Modular monolith (MVP) | Faster development; extract later |
| Database | PostgreSQL 16 | ACID compliance, RLS, JSON support |
| ORM | Prisma | Type-safe, migration support, RLS compatible |
| Queue | BullMQ | Redis-backed, reliable, delayed jobs |
| Frontend framework | Next.js 15 | SSR, App Router, React ecosystem |
| API style | REST (v1) | Simplicity, Swagger docs, wide compatibility |
| Container orchestration | Kubernetes (EKS) | Industry standard, auto-scaling |
| IaC | Terraform | Declarative, multi-cloud capable |
| CI/CD | GitHub Actions | Native integration, marketplace |

---

*Document end. Next: Database Architecture → `04-database-architecture.md`*
