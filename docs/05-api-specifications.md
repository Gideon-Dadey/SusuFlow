# SusuFlow — API Specifications

**Version:** 1.0.0  
**Base URL:** `https://api.susuflow.com/v1`  
**Tenant URL:** `https://{tenant}.susuflow.com/api/v1`  
**Date:** June 18, 2026

---

## 1. API Standards

### 1.1 Conventions

| Aspect | Standard |
|--------|----------|
| Protocol | HTTPS only (TLS 1.3) |
| Format | JSON (`application/json`) |
| Versioning | URL path prefix `/v1` |
| Authentication | Bearer JWT in `Authorization` header |
| Tenant context | Resolved from subdomain or `X-Tenant-ID` header (super admin) |
| Pagination | Cursor-based: `?cursor=xxx&limit=20` (max 100) |
| Filtering | Query params: `?status=active&type=deposit` |
| Sorting | `?sort=created_at&order=desc` |
| Idempotency | `Idempotency-Key` header on POST/PUT |
| Rate limiting | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers |
| Request ID | `X-Request-ID` echoed in response |
| Errors | RFC 7807 Problem Details format |

### 1.2 Standard Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-06-18T10:30:00Z"
  }
}
```

### 1.3 Paginated Response

```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "request_id": "req_abc123",
    "pagination": {
      "cursor": "eyJpZCI6...",
      "has_more": true,
      "total_count": 150
    }
  }
}
```

### 1.4 Error Response (RFC 7807)

```json
{
  "type": "https://api.susuflow.com/errors/validation",
  "title": "Validation Error",
  "status": 422,
  "detail": "Phone number is required",
  "instance": "/v1/customers",
  "errors": [
    { "field": "phone", "message": "Phone number is required" }
  ]
}
```

### 1.5 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, idempotency) |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 2. Authentication APIs

### POST /auth/register

Register a new customer account.

**Request:**
```json
{
  "first_name": "Kwame",
  "last_name": "Mensah",
  "email": "kwame@example.com",
  "phone": "+233241234567",
  "password": "SecureP@ss123!",
  "collector_code": "COL-ABC123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "message": "Verification codes sent to email and phone"
  }
}
```

### POST /auth/login

**Request:**
```json
{
  "email": "kwame@example.com",
  "password": "SecureP@ss123!",
  "device_fingerprint": "fp_abc123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "rt_abc123",
    "expires_in": 900,
    "mfa_required": false,
    "user": {
      "id": "uuid",
      "email": "kwame@example.com",
      "roles": ["customer"]
    }
  }
}
```

### POST /auth/mfa/verify

**Request:**
```json
{
  "code": "123456",
  "mfa_token": "mfa_temp_token"
}
```

### POST /auth/refresh

**Request:**
```json
{
  "refresh_token": "rt_abc123"
}
```

### POST /auth/logout

Revokes refresh token.

### POST /auth/forgot-password

### POST /auth/reset-password

### POST /auth/verify-email

### POST /auth/verify-phone

---

## 3. Tenant APIs (Super Admin)

### POST /admin/tenants

Create a new tenant.

**Request:**
```json
{
  "slug": "abc-susu",
  "name": "ABC Susu Company",
  "email": "admin@abcsusu.com",
  "phone": "+233201234567",
  "plan": "starter"
}
```

### GET /admin/tenants

List all tenants with pagination and filtering.

### GET /admin/tenants/:id

### PATCH /admin/tenants/:id

Update tenant settings, status.

### POST /admin/tenants/:id/suspend

### POST /admin/tenants/:id/activate

---

## 4. Customer APIs

### POST /customers

Create customer (staff/collector onboarding).

**Permissions:** `customer:create`  
**Roles:** company_admin, account_officer, collector

**Request:**
```json
{
  "first_name": "Kwame",
  "last_name": "Mensah",
  "email": "kwame@example.com",
  "phone": "+233241234567",
  "ghana_card_number": "GHA-123456789-0",
  "date_of_birth": "1990-05-15",
  "address": "Accra, Ghana",
  "savings_plan_id": "uuid"
}
```

### GET /customers

List customers with search, filter, pagination.

**Query params:** `?search=kwame&status=active&collector_id=uuid&cursor=xxx&limit=20`

### GET /customers/:id

Get customer details including wallet balance.

### PATCH /customers/:id

Update customer profile.

### GET /customers/:id/transactions

Customer transaction history.

### GET /customers/:id/statement

Generate account statement.

**Query params:** `?from=2026-01-01&to=2026-06-18&format=pdf`

### POST /customers/:id/assign-collector

**Request:**
```json
{
  "collector_id": "uuid"
}
```

---

## 5. Deposit APIs

### POST /deposits

Initiate a deposit.

**Permissions:** `deposit:create`  
**Roles:** customer, collector, account_officer

**Request:**
```json
{
  "amount": 100.00,
  "payment_method": "mtn_momo",
  "customer_id": "uuid",
  "payer_phone": "+233241234567",
  "idempotency_key": "dep_unique_key_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "reference": "TXN-20260618-ABC123",
    "status": "pending",
    "payment": {
      "id": "uuid",
      "gateway": "hubtel",
      "payment_url": "https://pay.hubtel.com/...",
      "expires_at": "2026-06-18T10:45:00Z"
    }
  }
}
```

### GET /deposits/:id

Get deposit status.

### GET /deposits

List deposits with filters.

**Query params:** `?status=completed&customer_id=uuid&from=2026-06-01&to=2026-06-18`

### POST /webhooks/hubtel

Payment gateway webhook (no auth — signature verified).

### POST /webhooks/paystack

---

## 6. Withdrawal APIs

### POST /withdrawals

Request a withdrawal.

**Permissions:** `withdrawal:create`  
**Roles:** customer

**Request:**
```json
{
  "amount": 500.00,
  "disbursement_method": "mtn_momo",
  "disbursement_phone": "+233241234567",
  "idempotency_key": "wd_unique_key_456"
}
```

### GET /withdrawals

List withdrawals.

### GET /withdrawals/:id

### POST /withdrawals/:id/approve

**Permissions:** `withdrawal:approve`  
**Roles:** company_admin

### POST /withdrawals/:id/reject

**Request:**
```json
{
  "reason": "Insufficient verification"
}
```

---

## 7. Wallet & Ledger APIs

### GET /wallets/:id

Get wallet details and balance.

### GET /wallets/:id/balance

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet_id": "uuid",
    "balance": 1500.00,
    "currency": "GHS",
    "last_transaction_at": "2026-06-18T09:00:00Z"
  }
}
```

### GET /ledger/entries

Query ledger entries (auditor, admin).

**Query params:** `?account_id=uuid&from=2026-01-01&to=2026-06-18`

### GET /ledger/reconciliation

Daily reconciliation report.

---

## 8. Collector APIs

### GET /collectors

List collectors with performance stats.

### GET /collectors/:id

### GET /collectors/:id/customers

Customers assigned to collector.

### GET /collectors/:id/deposits

Deposits assisted by collector.

### GET /collectors/:id/commissions

Commission earnings.

### GET /collectors/me/dashboard

Collector's own dashboard (when logged in as collector).

---

## 9. Dashboard & Reporting APIs

### GET /dashboard/summary

**Response:**
```json
{
  "success": true,
  "data": {
    "total_deposits_today": 25000.00,
    "deposit_count_today": 45,
    "total_withdrawals_today": 5000.00,
    "active_customers": 1250,
    "pending_withdrawals": 3,
    "recent_transactions": [ ]
  }
}
```

### GET /reports/deposits

**Query params:** `?period=daily&from=2026-06-01&to=2026-06-18&format=csv`

### GET /reports/customers

Customer growth report.

### GET /reports/collectors

Collector performance report.

### GET /reports/financial

Revenue, expenses, profit report.

---

## 10. Notification APIs

### GET /notifications

User's notifications.

### PATCH /notifications/:id/read

### GET /notifications/preferences

### PUT /notifications/preferences

**Request:**
```json
{
  "email_enabled": true,
  "sms_enabled": true,
  "push_enabled": false,
  "whatsapp_enabled": false
}
```

---

## 11. KYC APIs

### POST /kyc/documents

Upload KYC document.

**Request:** `multipart/form-data`
- `document_type`: ghana_card | passport | utility_bill | selfie
- `file`: binary

### GET /kyc/documents

List customer's KYC documents.

### POST /kyc/documents/:id/review

**Permissions:** `kyc:review`  
**Roles:** company_admin, account_officer

**Request:**
```json
{
  "status": "approved",
  "rejection_reason": null
}
```

### POST /kyc/verify-ghana-card

**Request:**
```json
{
  "ghana_card_number": "GHA-123456789-0",
  "first_name": "Kwame",
  "last_name": "Mensah",
  "date_of_birth": "1990-05-15"
}
```

---

## 12. Audit APIs

### GET /audit/logs

**Permissions:** `audit:read`  
**Roles:** company_admin, auditor, super_admin

**Query params:** `?user_id=uuid&action=deposit.complete&from=2026-06-01&resource_type=transaction`

### GET /audit/logs/:id

Get single audit log with full before/after state.

### GET /audit/logs/export

Export audit logs.

**Query params:** `?from=2026-01-01&to=2026-06-18&format=csv`

---

## 13. Fraud APIs

### GET /fraud/alerts

List fraud alerts.

### GET /fraud/alerts/:id

### PATCH /fraud/alerts/:id

Update alert status.

**Request:**
```json
{
  "status": "resolved",
  "notes": "Confirmed legitimate transaction"
}
```

---

## 14. Staff Management APIs

### POST /staff

Create staff user.

**Permissions:** `user:create`  
**Roles:** company_admin

**Request:**
```json
{
  "email": "officer@abcsusu.com",
  "first_name": "Ama",
  "last_name": "Asante",
  "phone": "+233201234567",
  "role": "account_officer"
}
```

### GET /staff

### GET /staff/:id

### PATCH /staff/:id

### DELETE /staff/:id

Deactivate staff user.

---

## 15. Savings Plan APIs

### POST /savings-plans

### GET /savings-plans

### GET /savings-plans/:id

### PATCH /savings-plans/:id

### POST /customers/:id/enroll-plan

**Request:**
```json
{
  "plan_id": "uuid",
  "target_amount": 5000.00
}
```

---

## 16. Subscription APIs (Super Admin)

### GET /admin/subscriptions

### GET /admin/subscriptions/:id

### POST /admin/subscriptions/:id/upgrade

---

## 17. Health & System APIs

### GET /health

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "queue": "healthy"
  }
}
```

### GET /health/ready

Kubernetes readiness probe.

### GET /health/live

Kubernetes liveness probe.

---

## 18. Rate Limits

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Auth (login, register) | 10 | 1 minute |
| Deposits | 30 | 1 minute |
| General API | 100 | 1 minute |
| Admin API | 200 | 1 minute |
| Webhooks | 1000 | 1 minute |
| Reports/exports | 10 | 1 minute |

---

## 19. Webhook Specifications

### Hubtel Payment Webhook

**Endpoint:** `POST /webhooks/hubtel`  
**Verification:** HMAC-SHA256 signature in `Hubtel-Callback-Signature` header

**Payload:**
```json
{
  "ResponseCode": "0000",
  "Message": "Success",
  "Data": {
    "CheckoutId": "hubtel_checkout_id",
    "SalesInvoiceId": "susuflow_payment_id",
    "ClientReference": "TXN-20260618-ABC123",
    "Amount": 100.00,
    "Charges": 1.50,
    "AmountAfterCharges": 98.50,
    "CustomerPhoneNumber": "233241234567",
    "Status": "Success",
    "PaymentDetails": {
      "MobileMoneyNumber": "233241234567",
      "PaymentType": "mobilemoney",
      "Channel": "mtn-gh"
    }
  }
}
```

**Processing:**
1. Verify HMAC signature
2. Lookup payment by `ClientReference`
3. Check idempotency (reject if already processed)
4. Update payment status
5. Post ledger entries
6. Enqueue receipt + notification jobs
7. Return 200 OK

---

*Document end. Swagger/OpenAPI spec generated at runtime via NestJS. Next: UI/UX Design → `06-ui-ux-design.md`*
