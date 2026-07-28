# 📡 SusuFlow — Field Collector Geofencing & Offline Sync Guide

**Document Reference**: `SusuFlow-FIELD-2026-GUIDE`  
**Target Audience**: Operations Managers, Field Supervisors, Technical Leads, Auditors

---

## 1. Overview & Architecture

In traditional Ghanaian Susu collection, field agents collect cash daily from traders at open markets (Makola, Kejetia, Madina, Kaneshie).

SusuFlow replaces paper passbooks with an **Offline-First Digital Mobile Gateway** paired with **GPS Geofence Anti-Fraud Safeguards**.

---

## 2. Geofence Anti-Fraud Verification (<15m Radius)

### 2.1 How Geofencing Works

1. Every registered customer profile stores their verified market stall / shop GPS coordinates (`latitude`, `longitude`).
2. When a collector logs a deposit on their mobile device, the browser/app captures high-accuracy HTML5 Geolocation coordinates (`navigator.geolocation.getCurrentPosition`).
3. The server computes the **Haversine Distance**:

$$d = 2r \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right) } \right)$$

4. If distance $d \le 15\text{ meters}$, the transaction is tagged **`Verified On-Site`**.
5. If distance $d > 15\text{ meters}$, the system triggers a **`Remote Collection Alert`** to prevent ghost entries logged from home or outside the market.

---

## 3. Offline-First Collection Queue & Synchronization

### 3.1 Offline Data Flow

```
 [Field Agent Device (No Internet)]
               │
               ▼
 [Local Storage / IndexedDB Queue] ──► Stores encrypted draft deposit
               │
   (Internet Connection Restored)
               │
               ▼
   [Background Sync Provider] ───────► Pushes queued items to /api/v1/deposits
               │
               ▼
 [Ledger Balance & SMS Dispatch] ────► Real-time customer receipt sent
```

### 3.2 Conflict Resolution

- **Queue Reference Uniqueness**: Every queued deposit generates a unique client-side UUID reference (e.g. `DEP_OFFLINE_1785275454576`).
- **Idempotency Guarantee**: If a network retry occurs, the NestJS API checks `reference` uniqueness before processing, preventing double-deposits.

---

## 4. Instant SMS & WhatsApp Receipt Protocol

- **Gateway Channels**: Integrated with Hubtel SMS API and WhatsApp Business Cloud API.
- **Payload Template**:
  > _"Dear Customer, GH₵[Amount] has been deposited into your [TenantName] Susu account. Your new balance is GH₵[Balance]. Ref: [CustomerNumber]"_
- **Audit Tracking**: All dispatched notifications are logged in `/staff/notifications` with delivery timestamp and status (`Delivered`).
