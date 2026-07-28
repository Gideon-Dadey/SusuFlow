# 💻 SusuFlow — Frontend Engineering & Next.js 15 Architecture Spec

**Document Reference**: `SusuFlow-FRONTEND-2026-SPEC`  
**Target Audience**: Senior Frontend Engineers, Next.js Developers, UI/UX Designers

---

## 1. Overview & Next.js 15 App Router Layout

The SusuFlow Web Portal (`apps/web`) is built on **Next.js 15 App Router**, React 19, TypeScript, and Vanilla CSS with Tailwind design tokens.

```
apps/web/src/
├── app/
│   ├── (auth)/             # Login, Register, Password Reset Pages
│   ├── (customer)/         # Customer Dashboard (/dashboard, /profile, /deposit)
│   ├── (staff)/            # Staff & Admin Portal (/staff/dashboard, /staff/calculator, /staff/excel, etc.)
│   ├── (collector)/        # Mobile Field Collector Portal (/collector/dashboard)
│   ├── (admin)/            # Super Admin Platform Management (/admin/tenants)
│   └── layout.tsx          # Root Layout & Global Providers
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Card, Input, Badge)
│   ├── layout/             # Sidebar, Header, Mobile Bottom Nav
│   └── financial/          # BalanceCard, TransactionRow, ReceiptModal
├── stores/                 # Zustand State Management (auth.store.ts)
├── lib/                    # API Clients, Utilities, & Navigation Config
└── styles/                 # Design System Tokens & Glassmorphism Utilities
```

---

## 2. State Management & Data Fetching Architecture

### 2.1 Authentication & Auth Store Persistence (`auth.store.ts`)

- Implemented with **Zustand** and `persist` middleware (storing token & user payload in `localStorage`).
- Automatic HTTP Header Injection: Intercepts API calls via `api.ts` to attach `Authorization: Bearer <token>` and `x-tenant-slug: <tenantSlug>`.
- Token Fallback: If `x-tenant-slug` header is unassigned, reads auth state fallback to resolve tenant context dynamically.

### 2.2 Server State Caching (`@tanstack/react-query`)

- All server data queries use **React Query** (`useQuery`, `useMutation`).
- **Stale Time & Cache Window**: 30-second stale time for dashboard metrics; 0-second for real-time wallet balances.
- Automatic Refetch: Refetches on window focus and network reconnection.

---

## 3. UI/UX Design Tokens & Aesthetics

### 3.1 Color Palette & Glassmorphism

- **Dark Mode Default**: Sleek slate background (`#020617` / `slate-950`) with emerald-green (`#10b981`) accent highlights.
- **Glass Card Overlay**: Semi-transparent card backdrops with `backdrop-blur-md` and subtle `border-border/40`.
- **Typography**: Clean sans-serif UI font with `font-mono` for financial numbers, transaction references, and currency amounts.
