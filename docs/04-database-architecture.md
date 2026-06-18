# SusuFlow — Database Architecture

**Version:** 1.0.0  
**Status:** Draft → Review  
**Date:** June 18, 2026  
**Depends on:** [03-system-architecture.md](./03-system-architecture.md)

---

## 1. Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   tenants   │──1:N──│    users     │──N:M──│    roles    │
└──────┬──────┘       └──────┬───────┘       └──────┬──────┘
       │                     │                       │
       │ 1:N                 │ 1:1                   │ N:M
       ▼                     ▼                       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  customers  │──1:N──│   wallets    │──1:N──│  accounts   │
└──────┬──────┘       └──────┬───────┘       └──────┬──────┘
       │                     │                       │
       │ N:1                 │                       │ 1:N
       ▼                     ▼                       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  collectors │       │ transactions │──1:N──│ledger_entries│
└─────────────┘       └──────┬───────┘       └─────────────┘
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
              ┌─────────┐ ┌────────┐ ┌──────────────┐
              │ payments│ │withdrawals│notifications│
              └─────────┘ └────────┘ └──────────────┘

┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│ audit_logs  │  │subscriptions │  │savings_plans│  │fraud_alerts  │
└─────────────┘  └──────────────┘  └─────────────┘  └──────────────┘
```

---

## 2. Schema Design Principles

1. **UUID primary keys** — no sequential ID leakage across tenants
2. **`tenant_id` on every tenant-scoped table** — enforced via RLS
3. **Timestamps** — `created_at`, `updated_at` on all tables; no `deleted_at` (use status enums)
4. **Immutable financial tables** — `ledger_entries`, `audit_logs` have no UPDATE/DELETE policies
5. **Soft status enums** — use `status` columns instead of hard deletes
6. **JSONB for flexible metadata** — `metadata`, `before_state`, `after_state`
7. **Indexed foreign keys** — all FK columns indexed
8. **Partitioning ready** — `audit_logs` and `ledger_entries` designed for time-based partitioning

---

## 3. Table Definitions

### 3.1 tenants

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Tenant identifier |
| slug | VARCHAR(30) | UNIQUE, NOT NULL | Subdomain slug (e.g., "abc") |
| name | VARCHAR(255) | NOT NULL | Company display name |
| email | VARCHAR(255) | NOT NULL | Primary contact email |
| phone | VARCHAR(20) | | Primary contact phone |
| logo_url | TEXT | | S3 URL for company logo |
| primary_color | VARCHAR(7) | DEFAULT '#1E40AF' | Brand color hex |
| status | tenant_status | NOT NULL, DEFAULT 'trial' | trial, active, suspended, closed |
| settings | JSONB | DEFAULT '{}' | Tenant-specific config |
| subscription_id | UUID | FK → subscriptions.id | Current subscription |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_tenants_slug` (UNIQUE), `idx_tenants_status`

### 3.2 users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NULL for super_admin | |
| email | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(20) | | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| status | user_status | NOT NULL, DEFAULT 'pending' | pending, active, suspended, locked |
| email_verified | BOOLEAN | DEFAULT false | |
| phone_verified | BOOLEAN | DEFAULT false | |
| mfa_enabled | BOOLEAN | DEFAULT false | |
| mfa_secret | VARCHAR(255) | | Encrypted TOTP secret |
| last_login_at | TIMESTAMPTZ | | |
| failed_login_count | INT | DEFAULT 0 | |
| locked_until | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_users_tenant_email` (UNIQUE per tenant), `idx_users_tenant_id`, `idx_users_status`

### 3.3 roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | super_admin, company_admin, account_officer, collector, customer, auditor |
| description | TEXT | | |
| is_system | BOOLEAN | DEFAULT false | System roles cannot be deleted |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### 3.4 permissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| name | VARCHAR(100) | UNIQUE, NOT NULL | e.g., deposit:create, withdrawal:approve |
| resource | VARCHAR(50) | NOT NULL | e.g., deposit, withdrawal, customer |
| action | VARCHAR(50) | NOT NULL | e.g., create, read, update, delete, approve |
| description | TEXT | | |

### 3.5 role_permissions

| Column | Type | Constraints |
|--------|------|-------------|
| role_id | UUID | FK → roles.id |
| permission_id | UUID | FK → permissions.id |
| | | PK (role_id, permission_id) |

### 3.6 user_roles

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | UUID | FK → users.id |
| role_id | UUID | FK → roles.id |
| tenant_id | UUID | FK → tenants.id |
| | | PK (user_id, role_id, tenant_id) |

### 3.7 customers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| user_id | UUID | FK → users.id, UNIQUE | Linked auth user |
| collector_id | UUID | FK → users.id, NULL | Assigned collector |
| customer_number | VARCHAR(20) | NOT NULL | Tenant-scoped customer ID |
| ghana_card_number | VARCHAR(20) | | Encrypted |
| date_of_birth | DATE | | |
| address | TEXT | | |
| kyc_level | INT | DEFAULT 0 | 0=none, 1=phone, 2=ghana_card, 3=full |
| kyc_status | kyc_status | DEFAULT 'pending' | pending, verified, rejected |
| status | customer_status | DEFAULT 'pending' | pending, active, suspended, closed |
| onboarded_by | UUID | FK → users.id | Who onboarded (collector/staff) |
| metadata | JSONB | DEFAULT '{}' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_customers_tenant` (tenant_id), `idx_customers_collector` (collector_id), `idx_customers_number` (UNIQUE tenant_id + customer_number), `idx_customers_status`

### 3.8 wallets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| customer_id | UUID | FK → customers.id, NULL | NULL for system wallets |
| wallet_type | wallet_type | NOT NULL | customer, commission, platform |
| currency | VARCHAR(3) | DEFAULT 'GHS' | ISO 4217 |
| status | wallet_status | DEFAULT 'active' | active, frozen, closed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_wallets_tenant_customer` (tenant_id, customer_id), `idx_wallets_type`

### 3.9 accounts (Chart of Accounts)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| wallet_id | UUID | FK → wallets.id, NULL | Linked wallet (if applicable) |
| code | VARCHAR(10) | NOT NULL | Account code (e.g., 1100) |
| name | VARCHAR(255) | NOT NULL | Account name |
| account_type | account_type | NOT NULL | asset, liability, revenue, expense, equity |
| parent_id | UUID | FK → accounts.id, NULL | For hierarchical COA |
| is_system | BOOLEAN | DEFAULT false | System accounts |
| status | account_status | DEFAULT 'active' | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_accounts_tenant_code` (UNIQUE tenant_id + code), `idx_accounts_wallet`

### 3.10 transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| reference | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable ref (TXN-20260618-ABC123) |
| type | transaction_type | NOT NULL | deposit, withdrawal, transfer, commission, reversal |
| status | transaction_status | NOT NULL, DEFAULT 'pending' | pending, processing, completed, failed, reversed |
| amount | DECIMAL(18,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'GHS' | |
| customer_id | UUID | FK → customers.id | |
| wallet_id | UUID | FK → wallets.id | |
| initiated_by | UUID | FK → users.id | User who initiated |
| collector_id | UUID | FK → users.id, NULL | Collector if assisted |
| description | TEXT | | |
| metadata | JSONB | DEFAULT '{}' | |
| idempotency_key | VARCHAR(255) | UNIQUE | Prevent duplicates |
| completed_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_transactions_tenant` (tenant_id), `idx_transactions_reference` (UNIQUE), `idx_transactions_customer` (customer_id), `idx_transactions_status` (status), `idx_transactions_type` (type), `idx_transactions_created` (created_at DESC), `idx_transactions_idempotency` (UNIQUE idempotency_key)

### 3.11 ledger_entries (IMMUTABLE)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| transaction_id | UUID | FK → transactions.id, NOT NULL | |
| account_id | UUID | FK → accounts.id, NOT NULL | |
| entry_type | entry_type | NOT NULL | debit, credit |
| amount | DECIMAL(18,2) | NOT NULL, CHECK (amount > 0) | Always positive |
| currency | VARCHAR(3) | DEFAULT 'GHS' | |
| description | TEXT | | |
| reversal_of | UUID | FK → ledger_entries.id, NULL | If this is a reversal |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_ledger_tenant` (tenant_id), `idx_ledger_transaction` (transaction_id), `idx_ledger_account` (account_id), `idx_ledger_created` (created_at DESC)

**Constraints:** No UPDATE or DELETE allowed (enforced via DB triggers + application layer)

### 3.12 payments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| transaction_id | UUID | FK → transactions.id, NOT NULL | |
| gateway | payment_gateway | NOT NULL | hubtel, paystack, flutterwave |
| gateway_reference | VARCHAR(255) | | External reference |
| payment_method | payment_method | NOT NULL | mtn_momo, telecel_cash, airteltigo, visa, mastercard, bank_transfer |
| amount | DECIMAL(18,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'GHS' | |
| status | payment_status | NOT NULL, DEFAULT 'initiated' | initiated, pending, success, failed, expired |
| payer_phone | VARCHAR(20) | | Customer phone for MoMo |
| gateway_response | JSONB | | Raw gateway response |
| webhook_received_at | TIMESTAMPTZ | | |
| expires_at | TIMESTAMPTZ | | 15-minute expiry |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_payments_transaction`, `idx_payments_gateway_ref` (UNIQUE gateway + gateway_reference), `idx_payments_status`

### 3.13 withdrawals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| transaction_id | UUID | FK → transactions.id, NOT NULL | |
| customer_id | UUID | FK → customers.id, NOT NULL | |
| amount | DECIMAL(18,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'GHS' | |
| status | withdrawal_status | NOT NULL, DEFAULT 'requested' | requested, approved, rejected, processing, completed, failed |
| disbursement_method | payment_method | NOT NULL | mtn_momo, telecel_cash, bank_transfer |
| disbursement_phone | VARCHAR(20) | | MoMo number for disbursement |
| approved_by | UUID | FK → users.id | Admin who approved |
| approved_at | TIMESTAMPTZ | | |
| rejection_reason | TEXT | | |
| gateway_reference | VARCHAR(255) | | Disbursement reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_withdrawals_tenant`, `idx_withdrawals_customer`, `idx_withdrawals_status`

### 3.14 audit_logs (IMMUTABLE)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NULL | NULL for platform-level actions |
| user_id | UUID | FK → users.id, NULL | |
| action | VARCHAR(100) | NOT NULL | e.g., customer.create, deposit.complete |
| resource_type | VARCHAR(50) | NOT NULL | e.g., customer, transaction |
| resource_id | UUID | | |
| ip_address | INET | | |
| user_agent | TEXT | | |
| device_id | VARCHAR(255) | | |
| geo_location | JSONB | | { country, city, lat, lng } |
| before_state | JSONB | | State before change |
| after_state | JSONB | | State after change |
| correlation_id | VARCHAR(50) | | Request correlation ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_audit_tenant` (tenant_id), `idx_audit_user` (user_id), `idx_audit_action` (action), `idx_audit_resource` (resource_type, resource_id), `idx_audit_created` (created_at DESC)

**Partitioning:** Range partition by `created_at` (monthly)

### 3.15 notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| user_id | UUID | FK → users.id | |
| channel | notification_channel | NOT NULL | email, sms, push, whatsapp |
| template | VARCHAR(100) | NOT NULL | Template identifier |
| recipient | VARCHAR(255) | NOT NULL | Email or phone |
| subject | VARCHAR(255) | | |
| body | TEXT | NOT NULL | |
| status | notification_status | DEFAULT 'pending' | pending, sent, failed, delivered |
| metadata | JSONB | DEFAULT '{}' | |
| sent_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

**Indexes:** `idx_notifications_tenant`, `idx_notifications_user`, `idx_notifications_status`

### 3.16 subscriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| plan | subscription_plan | NOT NULL | starter, growth, enterprise |
| status | subscription_status | NOT NULL, DEFAULT 'trialing' | trialing, active, past_due, cancelled |
| current_period_start | TIMESTAMPTZ | NOT NULL | |
| current_period_end | TIMESTAMPTZ | NOT NULL | |
| trial_end | TIMESTAMPTZ | | |
| cancelled_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### 3.17 savings_plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | e.g., "Daily Susu", "Weekly Susu" |
| description | TEXT | | |
| frequency | plan_frequency | NOT NULL | daily, weekly, biweekly, monthly |
| min_amount | DECIMAL(18,2) | NOT NULL | |
| max_amount | DECIMAL(18,2) | | |
| duration_months | INT | | Plan duration |
| status | plan_status | DEFAULT 'active' | active, inactive |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### 3.18 customer_plans

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| customer_id | UUID | FK → customers.id |
| plan_id | UUID | FK → savings_plans.id |
| target_amount | DECIMAL(18,2) | |
| status | plan_status | DEFAULT 'active' |
| started_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| ends_at | TIMESTAMPTZ | |

### 3.19 fraud_alerts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| tenant_id | UUID | FK → tenants.id, NOT NULL | |
| rule | VARCHAR(100) | NOT NULL | Rule that triggered |
| severity | alert_severity | NOT NULL | low, medium, high, critical |
| status | alert_status | DEFAULT 'open' | open, investigating, resolved, false_positive |
| resource_type | VARCHAR(50) | | |
| resource_id | UUID | | |
| details | JSONB | NOT NULL | |
| resolved_by | UUID | FK → users.id | |
| resolved_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### 3.20 devices

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | |
| fingerprint | VARCHAR(255) | NOT NULL | Device fingerprint hash |
| name | VARCHAR(255) | | User-friendly device name |
| last_ip | INET | | |
| last_used_at | TIMESTAMPTZ | | |
| is_trusted | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

### 3.21 refresh_tokens

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token_hash | VARCHAR(255) | UNIQUE |
| device_id | UUID | FK → devices.id |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### 3.22 kyc_documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| customer_id | UUID | FK → customers.id, NOT NULL | |
| document_type | document_type | NOT NULL | ghana_card, passport, utility_bill, selfie |
| file_url | TEXT | NOT NULL | S3 URL |
| status | document_status | DEFAULT 'pending' | pending, approved, rejected |
| reviewed_by | UUID | FK → users.id | |
| reviewed_at | TIMESTAMPTZ | | |
| rejection_reason | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | |

---

## 4. Enum Types

```sql
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'closed');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'locked');
CREATE TYPE customer_status AS ENUM ('pending', 'active', 'suspended', 'closed');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE wallet_type AS ENUM ('customer', 'commission', 'platform');
CREATE TYPE wallet_status AS ENUM ('active', 'frozen', 'closed');
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'revenue', 'expense', 'equity');
CREATE TYPE account_status AS ENUM ('active', 'inactive');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'transfer', 'commission', 'reversal');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'reversed');
CREATE TYPE entry_type AS ENUM ('debit', 'credit');
CREATE TYPE payment_gateway AS ENUM ('hubtel', 'paystack', 'flutterwave');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'telecel_cash', 'airteltigo', 'visa', 'mastercard', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('initiated', 'pending', 'success', 'failed', 'expired');
CREATE TYPE withdrawal_status AS ENUM ('requested', 'approved', 'rejected', 'processing', 'completed', 'failed');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'whatsapp');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'delivered');
CREATE TYPE subscription_plan AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled');
CREATE TYPE plan_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE plan_status AS ENUM ('active', 'inactive');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'investigating', 'resolved', 'false_positive');
CREATE TYPE document_type AS ENUM ('ghana_card', 'passport', 'utility_bill', 'selfie');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
```

---

## 5. Row-Level Security Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Template policy (applied to each table)
CREATE POLICY tenant_isolation ON customers
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Prevent modifications to immutable tables
CREATE POLICY no_update ON ledger_entries FOR UPDATE USING (false);
CREATE POLICY no_delete ON ledger_entries FOR DELETE USING (false);
CREATE POLICY no_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY no_delete ON audit_logs FOR DELETE USING (false);
```

---

## 6. Key Relationships Summary

| Parent | Child | Relationship | FK Column |
|--------|-------|-------------|-----------|
| tenants | users | 1:N | users.tenant_id |
| tenants | customers | 1:N | customers.tenant_id |
| tenants | transactions | 1:N | transactions.tenant_id |
| users | customers | 1:1 | customers.user_id |
| users | customers (collector) | 1:N | customers.collector_id |
| customers | wallets | 1:N | wallets.customer_id |
| wallets | accounts | 1:N | accounts.wallet_id |
| transactions | ledger_entries | 1:N | ledger_entries.transaction_id |
| transactions | payments | 1:1 | payments.transaction_id |
| transactions | withdrawals | 1:1 | withdrawals.transaction_id |
| accounts | ledger_entries | 1:N | ledger_entries.account_id |
| roles | permissions | N:M | role_permissions |
| users | roles | N:M | user_roles |

---

## 7. Balance Calculation View

```sql
CREATE VIEW account_balances AS
SELECT
  a.id AS account_id,
  a.tenant_id,
  a.wallet_id,
  a.code,
  a.name,
  a.account_type,
  COALESCE(SUM(
    CASE
      WHEN le.entry_type = 'credit' AND a.account_type IN ('liability', 'revenue', 'equity') THEN le.amount
      WHEN le.entry_type = 'debit'  AND a.account_type IN ('liability', 'revenue', 'equity') THEN -le.amount
      WHEN le.entry_type = 'debit'  AND a.account_type IN ('asset', 'expense') THEN le.amount
      WHEN le.entry_type = 'credit' AND a.account_type IN ('asset', 'expense') THEN -le.amount
      ELSE 0
    END
  ), 0) AS balance
FROM accounts a
LEFT JOIN ledger_entries le ON le.account_id = a.id
GROUP BY a.id, a.tenant_id, a.wallet_id, a.code, a.name, a.account_type;
```

---

*Document end. Migration scripts in `packages/database/migrations/`. Next: API Specifications → `05-api-specifications.md`*
