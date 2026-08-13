# SusuFlow — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Draft → Review  
**Date:** June 18, 2026  
**Author:** SusuFlow Product Team  
**Classification:** Internal — Confidential

---

## 1. Executive Summary

### 1.1 Product Vision

SusuFlow is a **multi-tenant, cloud-native digital savings platform** purpose-built for susu (rotating savings and credit association) operators across Ghana and Africa. The platform eliminates collector-side fraud by routing all customer deposits directly through verified payment gateways into centralized digital accounts, while preserving the collector role as a **cashless onboarding and education agent**.

### 1.2 Mission Statement

> Eliminate fraud in traditional susu collection systems by allowing customers to deposit directly into a centralized digital account rather than handing cash to collectors.

### 1.3 Problem Statement

| Actor            | Current Behavior                          | Failure Mode                                   |
| ---------------- | ----------------------------------------- | ---------------------------------------------- |
| Customer (Kwame) | Hands GHS 1,000 cash to collector         | No independent proof of payment                |
| Collector (Nana) | Records GHS 800 in manual ledger          | Skims GHS 200 undetected                       |
| Management       | Discovers fraud only on statement request | Revenue leakage, trust erosion, legal exposure |

**Root causes:** Manual cash handling, no real-time visibility, no immutable audit trail, no payment gateway confirmation, opaque collector records.

### 1.4 Solution Overview

A SaaS platform where:

1. Customers create digital accounts and deposit via MoMo, cards, or bank transfer.
2. Every deposit is confirmed by the payment gateway — not the collector.
3. Double-entry ledger records are created automatically and are immutable.
4. Collectors onboard customers and assist with digital deposits but **never hold customer funds**.
5. Management sees real-time dashboards, audit trails, and fraud alerts.
6. Each susu company operates on an isolated tenant subdomain (e.g., `abc.susuflow.com`).

### 1.5 Hybrid Collector Model (Key Differentiator)

Traditional susu companies rely on collector relationships for customer acquisition and trust. SusuFlow preserves this workforce while eliminating fraud:

| Legacy Collector Role     | SusuFlow Collector Role                   |
| ------------------------- | ----------------------------------------- |
| Collects cash             | **Does not touch cash**                   |
| Records deposits manually | Assists customer to initiate MoMo deposit |
| Holds float               | Zero float — funds go direct to platform  |
| Source of truth           | Payment gateway is source of truth        |

Collectors earn commissions on **verified digital deposits** they assist, incentivizing adoption without fraud vectors.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| Goal               | Target (Year 1)                               |
| ------------------ | --------------------------------------------- |
| Tenant acquisition | 50 susu companies onboarded                   |
| Customer accounts  | 100,000 active savers                         |
| Fraud reduction    | 95% reduction in collector skimming incidents |
| Deposit volume     | GHS 50M monthly processed                     |
| Platform uptime    | 99.9% SLA                                     |
| NPS (customers)    | ≥ 60                                          |

### 2.2 Product KPIs

| Metric                          | Definition                                  | Target                  |
| ------------------------------- | ------------------------------------------- | ----------------------- |
| Deposit success rate            | Successful gateway confirmations / attempts | ≥ 98%                   |
| Time to receipt                 | Deposit confirmation → receipt delivery     | < 30 seconds            |
| Onboarding completion           | Registered → first deposit within 7 days    | ≥ 40%                   |
| Collector-assisted deposit rate | Deposits initiated with collector present   | ≥ 60% (hybrid adoption) |
| Withdrawal SLA                  | Request → disbursement (approved)           | < 24 hours              |
| Audit log completeness          | Actions with full audit context             | 100%                    |

### 2.3 Non-Goals (MVP)

- Open Banking integrations (Phase 4)
- API Marketplace (Phase 4)
- Cross-border remittance
- Lending / credit products
- Cryptocurrency deposits
- White-label mobile apps (web-first MVP)

---

## 3. User Personas

### 3.1 Super Admin (Platform Operator)

- **Who:** SusuFlow internal operations team
- **Needs:** Tenant lifecycle management, system health, subscription billing, cross-tenant fraud monitoring
- **Pain:** No unified view across tenants; manual onboarding

### 3.2 Company Admin (Susu Operator Management)

- **Who:** CEO, operations manager of a susu company
- **Needs:** Real-time deposit visibility, staff management, withdrawal approvals, reports, product configuration
- **Pain:** Cannot trust collector reports; delayed fraud discovery

### 3.3 Account Officer (Back-office Staff)

- **Who:** Branch staff managing customer accounts
- **Needs:** Customer CRUD, savings plan setup, transaction monitoring
- **Pain:** Manual reconciliation; paper-based records

### 3.4 Collector (Cashless Agent) — _Enhanced Role_

- **Who:** Field agent traditionally collecting cash
- **Needs:** Customer onboarding tools, deposit assistance workflow, commission tracking
- **Pain:** Stigma of fraud; job insecurity with digitization
- **SusuFlow answer:** Retain role, remove cash handling, pay commission on verified deposits

### 3.5 Customer (Saver)

- **Who:** Individual saving via susu scheme
- **Needs:** Easy deposits, instant receipts, balance visibility, statements, withdrawals
- **Pain:** No proof of payment; distrust of collectors

### 3.6 Auditor (Compliance)

- **Who:** Internal/external auditor, regulator liaison
- **Needs:** Immutable logs, exportable reports, before/after state on all changes
- **Pain:** Incomplete paper trails; tampered records

---

## 4. User Roles & Permissions Matrix

| Capability                | Super Admin | Company Admin | Account Officer |  Collector   |    Customer    | Auditor |
| ------------------------- | :---------: | :-----------: | :-------------: | :----------: | :------------: | :-----: |
| Manage tenants            |     ✅      |      ❌       |       ❌        |      ❌      |       ❌       |   ❌    |
| Manage company settings   |     ❌      |      ✅       |       ❌        |      ❌      |       ❌       |   👁️    |
| Create staff users        |     ❌      |      ✅       |       ❌        |      ❌      |       ❌       |   ❌    |
| Onboard customers         |     ❌      |      ✅       |       ✅        |      ✅      |      Self      |   ❌    |
| Initiate deposit (assist) |     ❌      |      ❌       |       ✅        |      ✅      |       ✅       |   ❌    |
| Approve withdrawals       |     ❌      |      ✅       |       ❌        |      ❌      |    Request     |   👁️    |
| View all transactions     |     ✅      |      ✅       |       ✅        | Own assisted |      Own       |   ✅    |
| View audit logs           |     ✅      |      ✅       |       ❌        |      ❌      |       ❌       |   ✅    |
| Export reports            |     ✅      |      ✅       |       ✅        |   Limited    | Own statements |   ✅    |
| Configure products/plans  |     ❌      |      ✅       |       ✅        |      ❌      |     Enroll     |   👁️    |
| Fraud alert management    |     ✅      |      ✅       |       ❌        |      ❌      |       ❌       |   👁️    |
| Subscription management   |     ✅      |      👁️       |       ❌        |      ❌      |       ❌       |   ❌    |

_👁️ = Read-only access_

---

## 5. Functional Requirements

### 5.1 Authentication & Identity (FR-AUTH)

| ID          | Requirement                                                 | Priority | Phase |
| ----------- | ----------------------------------------------------------- | -------- | ----- |
| FR-AUTH-001 | Email/password registration with email verification         | P0       | 1     |
| FR-AUTH-002 | Phone number verification (SMS OTP)                         | P0       | 1     |
| FR-AUTH-003 | JWT access tokens (15 min) + refresh tokens (7 days)        | P0       | 1     |
| FR-AUTH-004 | MFA via TOTP (Google Authenticator)                         | P0       | 1     |
| FR-AUTH-005 | Device fingerprinting and trusted device management         | P1       | 1     |
| FR-AUTH-006 | OAuth 2.0 (Google) for staff login                          | P2       | 2     |
| FR-AUTH-007 | Password reset via email + SMS                              | P0       | 1     |
| FR-AUTH-008 | Session invalidation on password change                     | P0       | 1     |
| FR-AUTH-009 | Account lockout after 5 failed attempts (30 min)            | P0       | 1     |
| FR-AUTH-010 | Subdomain-based tenant resolution (`{tenant}.susuflow.com`) | P0       | 1     |

### 5.2 Multi-Tenancy (FR-TENANT)

| ID            | Requirement                                                | Priority | Phase |
| ------------- | ---------------------------------------------------------- | -------- | ----- |
| FR-TENANT-001 | Tenant provisioning with unique subdomain                  | P0       | 1     |
| FR-TENANT-002 | Row-level data isolation per tenant                        | P0       | 1     |
| FR-TENANT-003 | Tenant branding (logo, colors, company name)               | P1       | 1     |
| FR-TENANT-004 | Tenant-specific settings (currency, timezone, products)    | P0       | 1     |
| FR-TENANT-005 | Subscription plan assignment (Starter, Growth, Enterprise) | P1       | 1     |
| FR-TENANT-006 | Tenant suspension/reactivation by Super Admin              | P0       | 1     |

### 5.3 Customer Management (FR-CUST)

| ID          | Requirement                                                    | Priority | Phase |
| ----------- | -------------------------------------------------------------- | -------- | ----- |
| FR-CUST-001 | Customer self-registration                                     | P0       | 1     |
| FR-CUST-002 | Collector-assisted registration (collector ID linked)          | P0       | 1     |
| FR-CUST-003 | Customer profile (name, phone, email, Ghana Card ID)           | P0       | 1     |
| FR-CUST-004 | Customer status lifecycle (pending, active, suspended, closed) | P0       | 1     |
| FR-CUST-005 | Savings plan enrollment                                        | P0       | 1     |
| FR-CUST-006 | Customer search, filter, pagination                            | P0       | 1     |
| FR-CUST-007 | Collector assignment to customer                               | P1       | 1     |

### 5.4 Wallet & Accounts (FR-WALLET)

| ID            | Requirement                                                   | Priority | Phase |
| ------------- | ------------------------------------------------------------- | -------- | ----- |
| FR-WALLET-001 | Auto-create wallet on customer activation                     | P0       | 1     |
| FR-WALLET-002 | Wallet balance derived from ledger (not stored balance field) | P0       | 1     |
| FR-WALLET-003 | Support multiple savings products per customer                | P1       | 2     |
| FR-WALLET-004 | Account types: savings, commission (collector)                | P1       | 1     |
| FR-WALLET-005 | Real-time balance display                                     | P0       | 1     |

### 5.5 Digital Deposits (FR-DEPOSIT)

| ID             | Requirement                                                                     | Priority | Phase |
| -------------- | ------------------------------------------------------------------------------- | -------- | ----- |
| FR-DEPOSIT-001 | MTN Mobile Money integration                                                    | P0       | 1     |
| FR-DEPOSIT-002 | Telecel Cash integration                                                        | P0       | 1     |
| FR-DEPOSIT-003 | AirtelTigo Money integration                                                    | P1       | 1     |
| FR-DEPOSIT-004 | Visa/Mastercard via Paystack                                                    | P1       | 2     |
| FR-DEPOSIT-005 | Bank transfer (virtual account)                                                 | P2       | 2     |
| FR-DEPOSIT-006 | Payment gateway webhook verification                                            | P0       | 1     |
| FR-DEPOSIT-007 | Idempotent deposit processing (no duplicate credits)                            | P0       | 1     |
| FR-DEPOSIT-008 | Collector-assisted deposit flow (collector present, customer confirms on phone) | P0       | 1     |
| FR-DEPOSIT-009 | Auto-generate ledger entries on confirmed payment                               | P0       | 1     |
| FR-DEPOSIT-010 | Instant receipt (PDF + email + SMS)                                             | P0       | 1     |

**Deposit Flow:**

```
Customer/Collector initiates deposit
    → Select amount + payment method
    → Redirect to payment gateway / USSD prompt
    → Customer confirms on their device
    → Gateway sends webhook to SusuFlow
    → SusuFlow verifies signature + idempotency
    → Double-entry ledger posted
    → Receipt generated
    → Notifications sent (email, SMS)
    → Real-time dashboard update
```

### 5.6 Withdrawals (FR-WITHDRAW)

| ID              | Requirement                                    | Priority | Phase |
| --------------- | ---------------------------------------------- | -------- | ----- |
| FR-WITHDRAW-001 | Customer withdrawal request                    | P0       | 2     |
| FR-WITHDRAW-002 | Company Admin approval workflow                | P0       | 2     |
| FR-WITHDRAW-003 | Auto-disbursement via MoMo on approval         | P0       | 2     |
| FR-WITHDRAW-004 | Withdrawal limits (daily, per-transaction)     | P1       | 2     |
| FR-WITHDRAW-005 | Ledger reversal entries on failed disbursement | P0       | 2     |
| FR-WITHDRAW-006 | Withdrawal receipt generation                  | P0       | 2     |

### 5.7 Ledger System (FR-LEDGER)

| ID            | Requirement                                   | Priority | Phase |
| ------------- | --------------------------------------------- | -------- | ----- |
| FR-LEDGER-001 | Double-entry accounting for every transaction | P0       | 1     |
| FR-LEDGER-002 | Immutable entries (no UPDATE/DELETE)          | P0       | 1     |
| FR-LEDGER-003 | Reversal entries only for corrections         | P0       | 1     |
| FR-LEDGER-004 | Chart of accounts per tenant                  | P0       | 1     |
| FR-LEDGER-005 | Balance reconciliation reports                | P0       | 2     |
| FR-LEDGER-006 | Transaction reference linking                 | P0       | 1     |

### 5.8 Audit System (FR-AUDIT)

| ID           | Requirement                               | Priority | Phase |
| ------------ | ----------------------------------------- | -------- | ----- |
| FR-AUDIT-001 | Log every state-changing action           | P0       | 1     |
| FR-AUDIT-002 | Capture: user, IP, device, geo, timestamp | P0       | 1     |
| FR-AUDIT-003 | Capture before/after state (JSON diff)    | P0       | 1     |
| FR-AUDIT-004 | Append-only storage (no deletion)         | P0       | 1     |
| FR-AUDIT-005 | Audit log search and export               | P1       | 2     |
| FR-AUDIT-006 | 7-year retention minimum                  | P0       | 1     |

### 5.9 Fraud Detection (FR-FRAUD)

| ID           | Requirement                         | Priority | Phase |
| ------------ | ----------------------------------- | -------- | ----- |
| FR-FRAUD-001 | Duplicate payment detection         | P1       | 3     |
| FR-FRAUD-002 | Unusual withdrawal pattern alerts   | P1       | 3     |
| FR-FRAUD-003 | Multiple failed login alerts        | P1       | 2     |
| FR-FRAUD-004 | Suspicious device change alerts     | P1       | 3     |
| FR-FRAUD-005 | High-value transaction review queue | P1       | 3     |
| FR-FRAUD-006 | AI-powered risk scoring             | P2       | 3     |
| FR-FRAUD-007 | Fraud alert dashboard for admins    | P1       | 3     |

### 5.10 Notifications (FR-NOTIFY)

| ID            | Requirement                               | Priority | Phase |
| ------------- | ----------------------------------------- | -------- | ----- |
| FR-NOTIFY-001 | Email notifications (transactional)       | P0       | 2     |
| FR-NOTIFY-002 | SMS notifications (deposits, withdrawals) | P0       | 2     |
| FR-NOTIFY-003 | Push notifications (web push)             | P2       | 3     |
| FR-NOTIFY-004 | WhatsApp notifications                    | P2       | 3     |
| FR-NOTIFY-005 | Notification preferences per user         | P1       | 2     |
| FR-NOTIFY-006 | Template management per tenant            | P1       | 2     |

### 5.11 Reporting (FR-REPORT)

| ID            | Requirement                         | Priority | Phase |
| ------------- | ----------------------------------- | -------- | ----- |
| FR-REPORT-001 | Management dashboard with KPIs      | P0       | 1     |
| FR-REPORT-002 | Daily/weekly/monthly/yearly reports | P1       | 2     |
| FR-REPORT-003 | Export PDF, Excel, CSV              | P1       | 2     |
| FR-REPORT-004 | Collector performance reports       | P1       | 2     |
| FR-REPORT-005 | Customer growth analytics           | P1       | 2     |
| FR-REPORT-006 | Revenue and profit tracking         | P1       | 2     |

### 5.12 KYC / Compliance (FR-KYC)

| ID         | Requirement                                       | Priority | Phase |
| ---------- | ------------------------------------------------- | -------- | ----- |
| FR-KYC-001 | Ghana Card number capture and validation          | P1       | 2     |
| FR-KYC-002 | Document upload (ID, proof of address)            | P1       | 2     |
| FR-KYC-003 | Selfie verification (liveness check)              | P2       | 2     |
| FR-KYC-004 | KYC status workflow (pending, verified, rejected) | P1       | 2     |
| FR-KYC-005 | AML transaction monitoring thresholds             | P2       | 3     |
| FR-KYC-006 | GDPR data subject access requests                 | P2       | 3     |

### 5.13 Collector Module (FR-COLLECTOR) — Hybrid Model

| ID             | Requirement                                                | Priority | Phase |
| -------------- | ---------------------------------------------------------- | -------- | ----- |
| FR-COLLECT-001 | Collector profile with territory/branch assignment         | P0       | 1     |
| FR-COLLECT-002 | Customer onboarding on behalf of customer (with consent)   | P0       | 1     |
| FR-COLLECT-003 | Deposit assistance workflow (initiate → customer confirms) | P0       | 1     |
| FR-COLLECT-004 | Commission wallet auto-credited on verified deposits       | P1       | 2     |
| FR-COLLECT-005 | Collector performance dashboard                            | P1       | 2     |
| FR-COLLECT-006 | Collector cannot modify transaction amounts                | P0       | 1     |
| FR-COLLECT-007 | Collector activity audit trail                             | P0       | 1     |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement                     | Target                  |
| ------------------------------- | ----------------------- |
| API response time (p95)         | < 200ms                 |
| Deposit confirmation processing | < 5 seconds             |
| Dashboard load time             | < 2 seconds             |
| Concurrent users per tenant     | 10,000                  |
| Transactions per second         | 500 TPS (platform-wide) |

### 6.2 Security

| Requirement           | Standard                      |
| --------------------- | ----------------------------- |
| Encryption in transit | TLS 1.3                       |
| Encryption at rest    | AES-256                       |
| Authentication        | JWT + MFA                     |
| Authorization         | RBAC + ABAC                   |
| OWASP Top 10          | Full mitigation               |
| PCI-DSS               | Level 4 (no card data stored) |
| Secrets management    | AWS Secrets Manager           |
| Penetration testing   | Annual third-party            |

### 6.3 Availability & Reliability

| Requirement                    | Target           |
| ------------------------------ | ---------------- |
| Uptime SLA                     | 99.9%            |
| RPO (Recovery Point Objective) | 1 hour           |
| RTO (Recovery Time Objective)  | 4 hours          |
| Database backups               | Hourly automated |
| Multi-AZ deployment            | Required         |

### 6.4 Scalability

- Horizontal scaling via Kubernetes
- Database read replicas for reporting
- Redis caching for sessions and rate limiting
- BullMQ for async job processing (notifications, receipts, webhooks)

### 6.5 Compliance

| Regulation                | Approach                                                   |
| ------------------------- | ---------------------------------------------------------- |
| Bank of Ghana guidelines  | Consult compliance counsel; design for licensing readiness |
| Ghana Data Protection Act | GDPR-aligned data handling                                 |
| PCI-DSS                   | Tokenized payments via gateways only                       |
| SOC 2 Type II             | Architecture designed for audit readiness                  |
| AML                       | Transaction monitoring, KYC workflows                      |

### 6.6 Accessibility

- WCAG 2.1 AA compliance
- Mobile-first responsive design
- Support for low-bandwidth connections (optimized payloads)

---

## 7. MVP Roadmap

### Phase 1 — Foundation (Weeks 1–8)

**Theme:** Core platform with deposits

- Multi-tenant authentication (JWT, MFA, email/phone verification)
- Tenant management and subdomain routing
- Customer accounts and wallets
- Digital deposits (MTN MoMo, Telecel Cash)
- Double-entry ledger
- Audit logging
- Customer and admin dashboards
- Collector-assisted deposit flow
- Basic receipt generation

**Exit criteria:** End-to-end deposit flow works; ledger balances reconcile; audit logs complete.

### Phase 2 — Operations (Weeks 9–14)

**Theme:** Withdrawals, notifications, compliance

- Withdrawal request and approval workflow
- Auto-disbursement via MoMo
- Email and SMS notifications
- KYC (Ghana Card, document upload)
- Management reports and exports
- Collector commission tracking

**Exit criteria:** Full deposit-withdrawal cycle; KYC workflow; reports exportable.

### Phase 3 — Intelligence (Weeks 15–20)

**Theme:** Fraud detection and analytics

- Rule-based fraud detection
- AI-powered risk scoring
- Fraud alert dashboard
- Advanced analytics and insights
- AirtelTigo Money integration
- Card payments (Paystack)

**Exit criteria:** Fraud alerts fire on test scenarios; AI model deployed.

### Phase 4 — Enterprise (Weeks 21–28)

**Theme:** Scale and ecosystem

- Open Banking integrations
- API Marketplace for third-party developers
- White-label options
- WhatsApp notifications
- Advanced ABAC policies
- Multi-region deployment

---

## 8. Integration Requirements

### 8.1 Payment Gateways

| Provider    | Use Case                              | Priority |
| ----------- | ------------------------------------- | -------- |
| Hubtel      | MTN MoMo, Telecel, AirtelTigo (Ghana) | P0       |
| Paystack    | Card payments, bank transfers         | P1       |
| Flutterwave | Backup / cross-border                 | P2       |

### 8.2 Communication

| Provider                 | Channel  | Priority |
| ------------------------ | -------- | -------- |
| Hubtel / Nalo SMS        | SMS      | P0       |
| SendGrid / AWS SES       | Email    | P0       |
| Firebase Cloud Messaging | Push     | P2       |
| WhatsApp Business API    | WhatsApp | P2       |

### 8.3 Identity Verification

| Provider                   | Use Case              | Priority |
| -------------------------- | --------------------- | -------- |
| NIA API (Ghana Card)       | Identity verification | P2       |
| Smile Identity / Youverify | Document + selfie KYC | P2       |

### 8.4 Infrastructure

| Service                 | Purpose                      |
| ----------------------- | ---------------------------- |
| AWS EKS                 | Kubernetes orchestration     |
| AWS RDS (PostgreSQL)    | Primary database             |
| AWS ElastiCache (Redis) | Cache and sessions           |
| AWS S3                  | Document and receipt storage |
| AWS CloudFront          | CDN                          |
| AWS Secrets Manager     | Secrets                      |
| AWS CloudWatch          | Monitoring                   |
| GitHub Actions          | CI/CD                        |

---

## 9. User Stories (MVP — Phase 1)

### Epic: Authentication

```
US-001: As a customer, I want to register with my phone number and email
        so that I can start saving digitally.
        Acceptance: OTP verification on phone; email confirmation link sent.

US-002: As a staff member, I want to log in with MFA
        so that my account is protected from unauthorized access.
        Acceptance: TOTP required after password; backup codes provided.

US-003: As a user, I want to access my company's portal via subdomain
        so that I see my company's branding and data only.
        Acceptance: abc.susuflow.com resolves to ABC Susu tenant.
```

### Epic: Collector-Assisted Deposits

```
US-010: As a collector, I want to onboard a new customer in the field
        so that they can start saving without visiting an office.
        Acceptance: Customer profile created; linked to collector ID;
                     customer receives welcome SMS.

US-011: As a collector, I want to help a customer initiate a MoMo deposit
        so that they save digitally while I'm present.
        Acceptance: Collector enters amount; customer receives MoMo prompt
                     on their phone; collector cannot modify amount after
                     initiation; deposit credited only on gateway confirmation.

US-012: As a collector, I want to see my assisted deposit history
        so that I can track my performance.
        Acceptance: List of deposits with status, amount, customer name, date.
```

### Epic: Deposits

```
US-020: As a customer, I want to deposit via MTN Mobile Money
        so that my savings are recorded instantly.
        Acceptance: MoMo prompt sent; on success, balance updated within 30s;
                     receipt emailed and SMS'd.

US-021: As a customer, I want to download a PDF receipt
        so that I have proof of my deposit.
        Acceptance: PDF contains transaction ID, amount, date, reference.
```

### Epic: Dashboard

```
US-030: As a company admin, I want to see real-time deposit totals
        so that I know exactly how much has been collected today.
        Acceptance: Dashboard updates within 5s of confirmed deposit;
                     shows today's total, count, and recent transactions.

US-031: As a customer, I want to see my total savings and recent activity
        so that I know my balance without asking a collector.
        Acceptance: Balance matches ledger; last 10 transactions shown.
```

---

## 10. Constraints & Assumptions

### 10.1 Constraints

- Ghana Cedi (GHS) is the primary currency for MVP
- Web application **and** native Expo customer app (`apps/mobile`) — see doc 23
- Payment gateway availability depends on third-party SLAs
- Regulatory licensing may be required — legal review needed before launch
- Internet connectivity in rural areas may be limited — optimize for low bandwidth

### 10.2 Assumptions

- Susu companies have existing customer bases to migrate
- Customers have mobile money accounts (MTN MoMo penetration > 50% in Ghana)
- Collectors have smartphones for onboarding assistance
- Hubtel API access is obtainable for MoMo aggregation
- Tenants will provide their own branding assets

---

## 11. Risks & Mitigations

| Risk                                    | Impact   | Likelihood | Mitigation                                               |
| --------------------------------------- | -------- | ---------- | -------------------------------------------------------- |
| Regulatory licensing required           | High     | Medium     | Engage legal counsel early; design for compliance        |
| Payment gateway downtime                | High     | Medium     | Multi-gateway fallback; queue and retry                  |
| Low collector adoption of digital model | High     | Medium     | Commission incentives; training program; hybrid workflow |
| Customer distrust of digital platform   | Medium   | Medium     | Instant receipts; SMS confirmations; collector presence  |
| Data breach                             | Critical | Low        | SOC2 architecture; encryption; pen testing; bug bounty   |
| Tenant data leakage (multi-tenancy)     | Critical | Low        | Row-level security; tenant isolation tests; ABAC         |
| Scalability bottlenecks                 | Medium   | Medium     | Load testing from Phase 1; horizontal scaling design     |

---

## 12. Glossary

| Term         | Definition                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| Susu         | Traditional rotating savings scheme common in West Africa                  |
| MoMo         | Mobile Money (e.g., MTN Mobile Money)                                      |
| Tenant       | A susu company using the SusuFlow platform                                 |
| Collector    | Field agent who traditionally collected cash; now assists digital deposits |
| Ledger Entry | Immutable debit or credit record in double-entry accounting                |
| Double-Entry | Accounting method where every transaction has equal debit and credit       |
| KYC          | Know Your Customer — identity verification                                 |
| AML          | Anti-Money Laundering                                                      |
| RBAC         | Role-Based Access Control                                                  |
| ABAC         | Attribute-Based Access Control                                             |

---

## 13. Approval & Sign-off

| Role               | Name      | Date | Status |
| ------------------ | --------- | ---- | ------ |
| Product Owner      | _Pending_ |      | ☐      |
| Engineering Lead   | _Pending_ |      | ☐      |
| Security Lead      | _Pending_ |      | ☐      |
| Compliance Officer | _Pending_ |      | ☐      |

---

## Appendix A: Competitive Landscape

| Competitor                     | Strength                       | SusuFlow Differentiator                           |
| ------------------------------ | ------------------------------ | ------------------------------------------------- |
| Traditional susu (manual)      | Trust, collector relationships | Digital transparency + collector preservation     |
| Fintech wallets (MTN MoMo app) | Ubiquitous MoMo                | Susu-specific savings plans, multi-tenant B2B     |
| Banking apps                   | Regulated, trusted             | Purpose-built for susu operators, affordable SaaS |
| Excel/paper ledgers            | Zero cost                      | Real-time, fraud-proof, audit-ready               |

---

_Document end. Next: Business Requirements Document (BRD) → `02-BRD.md`_
