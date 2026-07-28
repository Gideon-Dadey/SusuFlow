# 📖 SusuFlow — Comprehensive Portal & Page-by-Page User Guide

**Document Reference**: `SusuFlow-PORTAL-GUIDE-2026`  
**Target Audience**: Company Admins, Staff Officers, Auditors, System Trainers, End Users

---

## 1. Overview of Platform Portals

SusuFlow features **4 specialized role-based portals**:

1. **Staff & Company Admin Portal** (`/staff/...`) — Day-to-day microfinance operations, general ledger, AI analytics, & tools.
2. **Super Admin Platform Portal** (`/admin/...`) — Multi-tenant organization onboarding & global infrastructure health.
3. **Customer Self-Service Portal** (`/dashboard`, `/profile`, etc.) — Individual savings, deposits, goal tracking & avatars.
4. **Field Collector Mobile Portal** (`/collector/...`) — Field collection, GPS geofenced deposits, & commission tracking.

---

## 2. Staff & Company Admin Portal (`/staff/...`)

### 🏢 PLATFORM & OPERATIONS

- **`/staff/dashboard` (Overview)**:
  - _Purpose_: Main operational command center.
  - _Key Features_: Displays Total Susu Deposits, Active Customer Count, Today's Field Collections, Action Queue items, and real-time transaction activity feed.

- **`/staff/queue` (Action Queue)**:
  - _Purpose_: Task management for pending staff authorizations.
  - _Key Features_: Lists pending customer withdrawals, unverified KYC documents, and exception overrides requiring admin sign-off.

- **`/staff/plans` (Savings Goals)**:
  - _Purpose_: Management of customer goal-locked savings vaults.
  - _Key Features_: Set interest-yielding targets, lock durations, and automated standing order rules.

- **`/staff/reports` (Reports Hub)**:
  - _Purpose_: Financial report generator.
  - _Key Features_: Generates CSV/PDF exports for daily transaction volume, month-end balance sheets, tax schedules, and collector performance metrics.

- **`/staff/audit` (Audit Logs)**:
  - _Purpose_: Regulatory compliance audit trail.
  - _Key Features_: Immutable record of all staff logins, account modifications, status changes, and settings edits with IP addresses and timestamps.

---

### 💰 FINANCE & RECONCILIATION

- **`/staff/deposits` (Deposits Register)**:
  - _Purpose_: Complete ledger of all customer deposits.
  - _Key Features_: Filter by deposit channel (Mobile Money, Card, Field Agent), status (`completed`, `pending`), and transaction reference.

- **`/staff/withdrawals` (Withdrawal Management)**:
  - _Purpose_: Withdrawal approval and payout gateway.
  - _Key Features_: Review withdrawal requests, verify customer wallet balance, authorize MoMo payouts, or reject invalid requests.

- **`/staff/commissions` (Collector Commissions)**:
  - _Purpose_: Field collector commission ledger.
  - _Key Features_: Tracks percentage service commissions earned by field collectors on verified deposits.

- **`/staff/ledger` (Trial Balance)**:
  - _Purpose_: Double-entry General Ledger trial balance.
  - _Key Features_: Verifies zero-imbalance invariant ($\sum \text{Debits} = \sum \text{Credits}$) across Asset, Liability, Revenue, and Expense accounts.

- **`/staff/reconciliation` (Bank & MoMo Reconciliation Hub)**:
  - _Purpose_: Automated external bank statement matching.
  - _Key Features_: Upload MTN MoMo / Telecel / Bank CSV statements. Automatically matches internal ledger entries against bank statement lines, reporting **GH₵0.00 zero-discrepancy**.

---

### 👥 PEOPLE & DIRECTORY

- **`/staff/customers` (Customer Directory)**:
  - _Purpose_: Main customer account list.
  - _Key Features_: Status filter tabs (_All_, _Active_, _Pending_, _Suspended_), instant search by name/email/phone/ID, customer avatar preview, and non-guessable 8-character IDs (`WLQDQ6WL`).

- **`/staff/customers/[id]` (Customer Detail Profile)**:
  - _Purpose_: Individual customer account view.
  - _Key Features_: Render customer avatar image, KYC verification level, wallet balance, account details, and full transaction history.

- **`/staff/kyc` (KYC Documents Queue)**:
  - _Purpose_: Identity verification workflow.
  - _Key Features_: Inspect uploaded Ghana Card / National ID photos, verify ID numbers against regulatory databases, and approve KYC levels (Level 0 to Level 3).

- **`/staff/team` (Team Management)**:
  - _Purpose_: Staff account officer directory.
  - _Key Features_: Create staff user accounts, assign roles (`company_admin`, `account_officer`, `auditor`), and manage branch access permissions.

- **`/staff/collectors` (Collector Directory)**:
  - _Purpose_: Field collector management.
  - _Key Features_: Roster of field agents, daily collection targets, assigned market routes, and commission structures.

---

### 🧠 INTELLIGENCE & AUTOMATION

- **`/staff/analytics` (AI Credit & Insights)**:
  - _Purpose_: Automated creditworthiness and risk scoring engine.
  - _Key Features_: Scores customers from **300 to 850**, assigns Risk Tier Badges (**Tier AAA** _Prime_, **Tier AA** _Stable_, **Tier B** _High Volatility_), and computes maximum micro-loan limits.

- **`/staff/notifications` (SMS & WhatsApp Dispatch)**:
  - _Purpose_: Messaging and automated deposit receipt hub.
  - _Key Features_: Automated instant deposit receipt alerts (Hubtel SMS / WhatsApp), bulk announcement dispatcher to all active customers, and real-time delivery logs.

- **`/staff/collectors/map` (Collector Live GPS Field Map)**:
  - _Purpose_: Satellite tracking and geofence fraud prevention.
  - _Key Features_: Live GPS pins for field agents in market zones (Makola, Madina, Kaneshie), **<15m proximity geofence verification**, and live verified deposit feed.

---

### 🛠️ TOOLS & UTILITIES

- **`/staff/calculator` (Financial & Accounting Suite)**:
  - _Purpose_: Multi-mode financial calculator.
  - _Key Features_: Smart Financial Keypad with memory (`M+`, `M-`) and history log, Compound Savings Growth Calculator, Loan Amortization Schedule, Reserve Liquidity Ratio, and Collector Yield Model.

- **`/staff/excel` (Spreadsheet Studio)**:
  - _Purpose_: In-browser financial spreadsheet.
  - _Key Features_: Interactive grid (A-Z, 1-50), live formula engine (`SUM`, `AVERAGE`, `MIN`, `MAX`, `PRODUCT`), formatting (Bold, Currency GH₵, Percentage %), pre-loaded financial templates, and CSV export.

---

### 🛡️ SECURITY & SETTINGS

- **`/staff/fraud` (Fraud Alerts)**:
  - _Purpose_: Anomaly detection monitor.
  - _Key Features_: Flags suspicious rapid transactions, off-hours deposits, or un-reconciled account variances.

- **`/staff/settings` (Company Settings & Branding)**:
  - _Purpose_: Organization customization.
  - _Key Features_: Upload company logo, customize primary theme color, set default Susu fees, and manage API keys.

---

## 3. Customer Self-Service Portal (`/...`)

- **`/dashboard` (Customer Home)**:
  - _Purpose_: Customer personal financial dashboard.
  - _Key Features_: Displays Total Savings balance, today's deposit total, quick links to deposit/withdraw, and recent transaction cards.

- **`/deposit` (Make Deposit)**:
  - _Purpose_: Self-service funds deposit.
  - _Key Features_: Initiate Mobile Money (MTN, Telecel, AT) or Credit/Debit card deposits.

- **`/withdraw` (Request Withdrawal)**:
  - _Purpose_: Self-service funds withdrawal.
  - _Key Features_: Request payout to Mobile Money wallet or bank account.

- **`/plans` (Savings Goals)**:
  - _Purpose_: Target savings tracking.
  - _Key Features_: Create new goal vaults (e.g., School Fees, Equipment), track progress bars, and view maturity dates.

- **`/profile` (Customer Profile & Avatar)**:
  - _Purpose_: Customer personal account management.
  - _Key Features_: Upload avatar photo (with client-side HTML5 canvas compression to 400x400px), view non-guessable 8-character ID (`WLQDQ6WL`), update phone/email, and inspect KYC status.

---

## 4. Field Collector Mobile Portal (`/collector/...`)

- **`/collector/dashboard` (Collector Home)**:
  - _Purpose_: Mobile dashboard for field agents.
  - _Key Features_: Today's collection summary, target progress bar, and quick deposit trigger.

- **`/collector/deposit` (Field Collection Form)**:
  - _Purpose_: Cashless deposit initiation at customer stalls.
  - _Key Features_: Select customer, enter amount, capture current GPS location for geofence verification, and trigger customer MoMo prompt.

- **`/collector/customers` (Assigned Route List)**:
  - _Purpose_: Daily market walk list.
  - _Key Features_: Customer names, stall numbers, phone numbers, and last deposit dates.

- **`/collector/earnings` (Commissions Log)**:
  - _Purpose_: Collector earnings tracker.
  - _Key Features_: Total commissions earned today, week-to-date, and payout history.

---

## 5. Super Admin Platform Portal (`/admin/...`)

- **`/admin/dashboard` (Platform Overview)**:
  - _Purpose_: Global SaaS platform metrics across all tenant companies.

- **`/admin/tenants` (Organizations Directory)**:
  - _Purpose_: Onboard and manage Susu microfinance companies, set subscription tiers, and configure custom domains.

- **`/admin/health` (System Health)**:
  - _Purpose_: Real-time monitoring of PostgreSQL, Redis, API response times, and server resources.

- **`/admin/dev-ops` (DevOps Control)**:
  - _Purpose_: Emergency gateway failover, maintenance locks, and global feature flags.
