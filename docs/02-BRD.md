# SusuFlow — Business Requirements Document (BRD)

**Version:** 1.0.0  
**Status:** Draft → Review  
**Date:** June 18, 2026  
**Depends on:** [01-PRD.md](./01-PRD.md)

---

## 1. Business Context

### 1.1 Market Opportunity

Ghana's informal savings sector processes an estimated **GHS 5–8 billion annually** through susu collectors. With 70%+ mobile money penetration and growing fintech adoption, the market is ready for digital transformation — but susu operators need a solution that respects their existing business model (collector networks) while eliminating fraud.

### 1.2 Business Model

**SaaS subscription** with usage-based transaction fees.

| Tier | Monthly Fee | Included Customers | Transaction Fee | Features |
|------|------------|-------------------|-----------------|----------|
| **Starter** | GHS 500 | Up to 500 | 0.5% per deposit | Core deposits, dashboard, 2 staff |
| **Growth** | GHS 2,000 | Up to 5,000 | 0.3% per deposit | + Withdrawals, KYC, reports, 10 staff |
| **Enterprise** | Custom | Unlimited | Negotiated | + API access, SLA, dedicated support, white-label |

**Additional revenue streams:**
- Setup/onboarding fee (one-time)
- SMS notification overage charges
- Premium fraud detection module
- API marketplace commission (Phase 4)

### 1.3 Value Proposition

| Stakeholder | Value |
|------------|-------|
| **Susu Company** | Eliminate collector fraud; real-time visibility; audit-ready records; reduce reconciliation time by 90% |
| **Customer** | Instant proof of deposit; 24/7 balance access; no cash risk |
| **Collector** | Keep their job; earn commission on verified deposits; professional tools |
| **Regulator** | Transparent, auditable financial records; AML/KYC compliance |
| **SusuFlow** | Recurring SaaS revenue; transaction fee income; network effects |

---

## 2. Business Rules

### 2.1 Tenant Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-T-001 | Each tenant must have a unique subdomain slug (3–30 chars, alphanumeric + hyphen) | DNS and routing |
| BR-T-002 | Suspended tenants cannot process transactions but retain read access for 90 days | Data preservation |
| BR-T-003 | Tenant deletion requires 30-day notice and data export | GDPR compliance |
| BR-T-004 | New tenants start on 14-day free trial (Starter tier) | Acquisition funnel |
| BR-T-005 | Tenant must configure at least one payment method before accepting deposits | Operational readiness |

### 2.2 Customer Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-C-001 | Customer must verify phone number before first deposit | Identity assurance |
| BR-C-002 | Customer must be 18+ years old | Legal requirement |
| BR-C-003 | One active wallet per customer per savings product | Accounting clarity |
| BR-C-004 | Customer can belong to only one tenant | Data isolation |
| BR-C-005 | Dormant account = no transaction in 90 days | Reporting definition |
| BR-C-006 | KYC Level 1 (phone verified) allows deposits up to GHS 5,000/month | Risk management |
| BR-C-007 | KYC Level 2 (Ghana Card verified) removes deposit limits | Compliance |

### 2.3 Deposit Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-D-001 | Minimum deposit: GHS 1.00 | Payment gateway limits |
| BR-D-002 | Maximum single deposit: GHS 50,000 (Level 2 KYC) | Risk management |
| BR-D-003 | Deposits are final — no customer-initiated reversal | Immutability principle |
| BR-D-004 | Deposit credited only on payment gateway confirmation | Fraud prevention |
| BR-D-005 | Duplicate gateway reference IDs are rejected (idempotency) | Double-credit prevention |
| BR-D-006 | Collector cannot modify deposit amount after customer initiates payment | Fraud prevention |
| BR-D-007 | Deposit must complete within 15 minutes or expire | Stale transaction cleanup |

### 2.4 Withdrawal Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-W-001 | Minimum withdrawal: GHS 10.00 | Cost efficiency |
| BR-W-002 | Withdrawal requires Company Admin approval | Control |
| BR-W-003 | Customer cannot withdraw more than available balance | Solvency |
| BR-W-004 | Daily withdrawal limit: GHS 10,000 per customer | Risk management |
| BR-W-005 | Withdrawal processing SLA: 24 hours (business days) | Customer expectation |
| BR-W-006 | Failed disbursement auto-reverses ledger entries | Accounting integrity |
| BR-W-007 | Pending withdrawals block corresponding balance | Double-spend prevention |

### 2.5 Collector Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-CL-001 | Collector commission: 1% of verified deposit amount (configurable per tenant) | Incentive alignment |
| BR-CL-002 | Commission credited only after deposit confirmation | No commission on failed deposits |
| BR-CL-003 | Collector cannot access customer wallet balance directly | Separation of duties |
| BR-CL-004 | Collector can only view customers they onboarded or are assigned to | Data privacy |
| BR-CL-005 | Collector activity is fully audited | Accountability |
| BR-CL-006 | Maximum 200 active customers per collector | Manageable portfolio |

### 2.6 Ledger Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-L-001 | Every financial event produces exactly 2 ledger entries (debit + credit) | Double-entry integrity |
| BR-L-002 | Sum of all debits must equal sum of all credits per tenant | Accounting equation |
| BR-L-003 | Ledger entries are immutable — no UPDATE or DELETE | Audit integrity |
| BR-L-004 | Corrections via reversal entries only, referencing original entry | Traceability |
| BR-L-005 | Balance = SUM(credits) - SUM(debits) for account | Derived, not stored |

### 2.7 Security Rules

| Rule ID | Rule | Rationale |
|---------|------|-----------|
| BR-S-001 | Password minimum: 12 chars, uppercase, lowercase, number, special char | OWASP |
| BR-S-002 | Session timeout: 30 minutes inactivity | Security |
| BR-S-003 | MFA required for all staff roles | Access control |
| BR-S-004 | API rate limit: 100 req/min per user, 1000 req/min per tenant | DDoS protection |
| BR-S-005 | PII encrypted at rest (AES-256) | Data protection |
| BR-S-006 | Audit logs retained minimum 7 years | Regulatory compliance |
| BR-S-007 | Failed login lockout: 5 attempts → 30-minute lock | Brute force protection |

---

## 3. Business Processes

### 3.1 Tenant Onboarding

```
Super Admin creates tenant
    → Assign subdomain (abc.susuflow.com)
    → Configure subscription tier
    → Company Admin receives invite email
    → Company Admin completes setup:
        - Company profile and branding
        - Payment gateway credentials
        - Staff accounts
        - Savings products
    → Trial period begins (14 days)
    → Tenant status: ACTIVE
```

### 3.2 Customer Onboarding (Self-Service)

```
Customer visits {tenant}.susuflow.com
    → Register (name, phone, email, password)
    → Verify phone (SMS OTP)
    → Verify email (link)
    → Profile created, wallet auto-generated
    → KYC Level 1 achieved
    → Customer can deposit (within limits)
```

### 3.3 Customer Onboarding (Collector-Assisted)

```
Collector logs into staff portal
    → "Onboard Customer" flow
    → Enter customer details (name, phone, email)
    → Customer receives SMS with registration link
    → Customer completes verification on their device
    → Customer linked to collector (collector_id)
    → Collector sees customer in their portfolio
```

### 3.4 Deposit Process (Collector-Assisted)

```
Collector selects customer from portfolio
    → Enters deposit amount
    → Selects payment method (MTN MoMo)
    → System generates payment request
    → Customer receives MoMo prompt on THEIR phone
    → Customer enters PIN on THEIR device
    → [Collector cannot see or enter PIN]
    → Payment gateway confirms payment
    → Webhook received by SusuFlow
    → Idempotency check (gateway reference)
    → Ledger entries created:
        DR: Platform Cash Account
        CR: Customer Wallet Account
    → If collector-assisted: commission entry:
        DR: Commission Expense
        CR: Collector Commission Wallet
    → Receipt generated (PDF)
    → Notifications: email + SMS to customer
    → Dashboard updated in real-time
    → Collector sees deposit in activity log
```

### 3.5 Withdrawal Process

```
Customer requests withdrawal (amount, MoMo number)
    → System validates balance and limits
    → Balance reserved (pending withdrawal)
    → Company Admin notified
    → Admin reviews and approves/rejects
    → If approved:
        → Disbursement initiated via payment gateway
        → On success:
            DR: Customer Wallet Account
            CR: Platform Cash Account
        → Receipt generated
        → Customer notified
    → If rejected:
        → Reserved balance released
        → Customer notified with reason
```

### 3.6 Subscription Billing

```
Monthly billing cycle
    → Calculate: base fee + (transaction volume × fee rate)
    → Generate invoice
    → Charge via configured payment method
    → If payment fails:
        → Retry at 3, 7, 14 days
        → After 14 days: tenant suspended
    → If payment succeeds:
        → Invoice marked paid
        → Usage counters reset
```

---

## 4. Financial Model

### 4.1 Chart of Accounts (Per Tenant)

| Code | Account Name | Type | Description |
|------|-------------|------|-------------|
| 1000 | Platform Cash | Asset | Funds held via payment gateways |
| 1100 | Customer Wallets | Liability | Aggregate customer balances owed |
| 1200 | Collector Commissions Payable | Liability | Unpaid collector commissions |
| 2000 | Withdrawals Pending | Liability | Approved but undisbursed withdrawals |
| 4000 | Transaction Fee Revenue | Revenue | Platform transaction fees |
| 4100 | Subscription Revenue | Revenue | Monthly SaaS fees |
| 5000 | Commission Expense | Expense | Collector commission payouts |
| 5100 | Payment Gateway Fees | Expense | Hubtel/Paystack fees |
| 5200 | SMS/Notification Costs | Expense | Communication costs |

### 4.2 Revenue Projections (Year 1)

| Quarter | Tenants | Avg Customers/Tenant | Monthly Deposits/Tenant | Platform Revenue |
|---------|---------|---------------------|------------------------|-----------------|
| Q1 | 10 | 200 | GHS 100K | GHS 15K/month |
| Q2 | 25 | 500 | GHS 250K | GHS 50K/month |
| Q3 | 40 | 1,000 | GHS 500K | GHS 120K/month |
| Q4 | 50 | 2,000 | GHS 1M | GHS 250K/month |

---

## 5. Regulatory Considerations

### 5.1 Ghana Regulatory Landscape

| Regulation | Applicability | SusuFlow Approach |
|-----------|--------------|-------------------|
| Bank of Ghana Payment Systems Act | Payment processing | Partner with licensed PSP (Hubtel); apply for EMI license if required |
| Ghana Data Protection Act, 2012 (Act 843) | All data processing | GDPR-aligned privacy policy; DPO appointment; data processing agreements |
| Anti-Money Laundering Act, 2020 (Act 1044) | Financial transactions | KYC workflows; transaction monitoring; suspicious activity reporting |
| Electronic Transactions Act, 2008 (Act 772) | Digital contracts | Terms of service; electronic consent; digital signatures |

### 5.2 Compliance Roadmap

| Phase | Compliance Activity |
|-------|-------------------|
| Pre-launch | Legal opinion on licensing requirements |
| Phase 1 | Privacy policy, terms of service, cookie policy |
| Phase 2 | KYC/AML workflows operational |
| Phase 3 | SOC 2 Type I audit initiated |
| Phase 4 | SOC 2 Type II; PCI-DSS SAQ-A |

---

## 6. Stakeholder Map

| Stakeholder | Interest | Engagement |
|------------|----------|------------|
| SusuFlow founders | Product success, revenue | Daily |
| Susu company owners | Fraud elimination, ROI | Weekly during onboarding |
| Collectors | Job security, commission | Training sessions |
| Customers | Trust, ease of use | In-app support |
| Bank of Ghana | Regulatory compliance | Quarterly reporting |
| Payment gateway partners | Transaction volume | Monthly reviews |
| Investors | Growth metrics | Monthly board reports |

---

## 7. Success Criteria for MVP Launch

| Criteria | Measurement | Target |
|----------|------------|--------|
| Pilot tenant onboarded | Count | ≥ 3 susu companies |
| End-to-end deposit works | Test transactions | 100% success on MoMo |
| Ledger reconciliation | Automated daily check | 0 discrepancies |
| Collector adoption | % deposits collector-assisted | ≥ 50% |
| Customer satisfaction | Post-deposit survey | ≥ 4.0/5.0 |
| System uptime during pilot | Monitoring | ≥ 99.5% |
| Security review passed | Penetration test | 0 critical findings |

---

*Document end. Next: System Architecture → `03-system-architecture.md`*
