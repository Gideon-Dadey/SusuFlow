# ⚙️ SusuFlow — Backend Engineering & NestJS Architecture Spec

**Document Reference**: `SusuFlow-BACKEND-2026-SPEC`  
**Target Audience**: Senior Backend Engineers, NestJS Developers, DevOps Engineers

---

## 1. Overview & Monorepo Structure

The SusuFlow API is built on **NestJS 10** using TypeScript in a high-performance modular micro-kernel architecture under `apps/api`.

```
apps/api/src/
├── common/                # Shared Guards, Interceptors, Filters, & Decorators
│   ├── decorators/       # @Tenant(), @CurrentUser(), @Roles()
│   ├── guards/           # JwtAuthGuard, RolesGuard, TenantGuard
│   ├── interceptors/     # AuditLogInterceptor, TransformInterceptor
│   └── filters/          # AllExceptionsFilter
├── modules/               # Core Business Modules
│   ├── auth/             # Authentication, JWT, Password Hashing
│   ├── tenant/           # Multi-tenant onboarding & configuration
│   ├── customer/         # Customer account lifecycle & KYC
│   ├── wallet/           # Customer wallet balances & ledger queries
│   ├── deposit/          # Deposit processing & MoMo webhook triggers
│   ├── withdrawal/       # Withdrawal requests & approval workflows
│   ├── ledger/           # Double-entry general ledger engine
│   ├── notification/     # SMS (Hubtel) & WhatsApp notification gateway
│   └── collector/        # Field collector tracking & GPS geofencing
├── prisma/               # Prisma ORM client service wrapper
└── main.ts               # Application bootstrap & Swagger initialization
```

---

## 2. Authentication & Multi-Tenant Request Lifecycle

```
 Incoming HTTP Request (e.g. POST /api/v1/deposits)
                       │
                       ▼
             [Cors & Helmet Security]
                       │
                       ▼
              [JwtAuthGuard (Passport)]
                       │
                       ├─ Verify Bearer JWT Token
                       └─ Attach Authenticated User to Request
                       │
                       ▼
                [Tenant Ingestion]
                       │
                       ├─ Extract 'x-tenant-slug' HTTP Header
                       └─ Fallback to user.tenantId if header omitted
                       │
                       ▼
                 [Controller Action]
                       │
                       ▼
           [Service Transaction & Ledger]
```

### 2.1 Custom Decorators

- `@Tenant()`: Injects validated `tenantId` into controller method params.
- `@CurrentUser()`: Injects authenticated user payload (`userId`, `roles`, `email`).

---

## 3. Database Transactions & Concurrency Control

### 3.1 Strict Transaction Enclosure

All financial operations run inside Prisma Interactive Transactions (`prisma.$transaction`) with `SERIALIZABLE` or `READ COMMITTED` isolation levels to prevent race conditions during simultaneous deposits or withdrawals.

```ts
const result = await this.prisma.$transaction(async (tx) => {
  // 1. Create Transaction Record
  const transaction = await tx.transaction.create({ ... });

  // 2. Post Debit Ledger Entry
  await tx.ledgerEntry.create({ entryType: 'debit', ... });

  // 3. Post Credit Ledger Entry
  await tx.ledgerEntry.create({ entryType: 'credit', ... });

  return transaction;
});
```

---

## 4. Background Job Processing (BullMQ & Redis)

- **Worker Module** (`apps/worker`): Asynchronous job queue processing using BullMQ & Redis.
- **Queues**:
  - `deposit-reconciliation-queue`: Processes Hubtel MoMo callback webhooks asynchronously.
  - `sms-dispatch-queue`: Sends automated customer receipt SMS & WhatsApp alerts without blocking main API response time.
  - `audit-log-queue`: Asynchronously writes security & data access logs to immutable PostgreSQL tables.
