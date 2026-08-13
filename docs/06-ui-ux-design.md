# SusuFlow — UI/UX Design Specification

**Version:** 1.0.0  
**Date:** June 18, 2026  
**Design System:** SusuFlow Design System v1

---

## 1. Design Philosophy

**"Trust through clarity"** — Every screen must reinforce financial transparency. Inspired by Stripe's precision, Mercury's elegance, and Monzo's approachability, adapted for the Ghanaian susu market.

### Design Principles

1. **Clarity over decoration** — financial data must be instantly readable
2. **Mobile-first** — 70%+ of users will access via mobile browsers
3. **Progressive disclosure** — show essentials first, details on demand
4. **Accessible** — WCAG 2.1 AA, high contrast, large touch targets (44px min)
5. **Localized** — GHS currency formatting, Ghana timezone, local phone formats
6. **Tenant-branded** — company logo and colors applied via CSS variables

---

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  /* Brand (overridable per tenant) */
  --color-primary: #1e40af; /* Blue 800 */
  --color-primary-hover: #1e3a8a; /* Blue 900 */
  --color-primary-light: #dbeafe; /* Blue 100 */

  /* Semantic */
  --color-success: #059669; /* Emerald 600 */
  --color-success-light: #d1fae5;
  --color-warning: #d97706; /* Amber 600 */
  --color-warning-light: #fef3c7;
  --color-danger: #dc2626; /* Red 600 */
  --color-danger-light: #fee2e2;
  --color-info: #2563eb; /* Blue 600 */

  /* Neutrals */
  --color-background: #fafafa; /* Gray 50 */
  --color-surface: #ffffff;
  --color-border: #e5e7eb; /* Gray 200 */
  --color-text-primary: #111827; /* Gray 900 */
  --color-text-secondary: #6b7280; /* Gray 500 */
  --color-text-muted: #9ca3af; /* Gray 400 */

  /* Financial */
  --color-credit: #059669; /* Green for deposits */
  --color-debit: #dc2626; /* Red for withdrawals */
}
```

### 2.2 Typography

| Token        | Font           | Size      | Weight | Usage                   |
| ------------ | -------------- | --------- | ------ | ----------------------- |
| `display-lg` | Inter          | 36px/40px | 700    | Dashboard hero numbers  |
| `display-md` | Inter          | 28px/32px | 700    | Page titles             |
| `heading-lg` | Inter          | 24px/28px | 600    | Section headings        |
| `heading-md` | Inter          | 20px/24px | 600    | Card titles             |
| `body-lg`    | Inter          | 16px/24px | 400    | Body text               |
| `body-md`    | Inter          | 14px/20px | 400    | Secondary text          |
| `body-sm`    | Inter          | 12px/16px | 400    | Captions, labels        |
| `mono`       | JetBrains Mono | 14px/20px | 400    | Transaction refs, codes |

### 2.3 Spacing

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

### 2.4 Border Radius

| Token  | Value  | Usage           |
| ------ | ------ | --------------- |
| `sm`   | 4px    | Badges, tags    |
| `md`   | 8px    | Buttons, inputs |
| `lg`   | 12px   | Cards           |
| `xl`   | 16px   | Modals, sheets  |
| `full` | 9999px | Avatars, pills  |

### 2.5 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

---

## 3. Component Library (ShadCN-based)

### Core Components

| Component | Variants                                   | Usage               |
| --------- | ------------------------------------------ | ------------------- |
| Button    | primary, secondary, outline, ghost, danger | CTAs, actions       |
| Input     | text, number, phone, password              | Forms               |
| Select    | single, searchable                         | Dropdowns           |
| Card      | default, interactive, stat                 | Content containers  |
| Table     | sortable, filterable, paginated            | Data lists          |
| Badge     | success, warning, danger, info, neutral    | Status indicators   |
| Dialog    | default, sheet (mobile)                    | Modals              |
| Toast     | success, error, info                       | Notifications       |
| Avatar    | image, initials                            | User representation |
| Skeleton  | text, card, table                          | Loading states      |
| Tabs      | underline, pills                           | Section navigation  |
| Stat Card | with trend indicator                       | Dashboard KPIs      |

### Financial Components (Custom)

| Component        | Description                                 |
| ---------------- | ------------------------------------------- |
| `MoneyDisplay`   | Formatted GHS amount with color (green/red) |
| `TransactionRow` | Type icon + amount + status + timestamp     |
| `BalanceCard`    | Large balance display with trend            |
| `DepositFlow`    | Multi-step deposit wizard                   |
| `ReceiptPreview` | PDF receipt preview card                    |
| `StatusBadge`    | Transaction status with appropriate color   |
| `PhoneInput`     | Ghana phone format (+233) with validation   |
| `GhanaCardInput` | Ghana Card number format (GHA-XXXXXXXXX-X)  |

---

## 4. Layout Structure

### 4.1 Customer Portal

```
┌─────────────────────────────────────────┐
│  Header: Logo | Balance | Profile Menu  │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (max-width: 640px centered on desktop) │
│                                         │
├─────────────────────────────────────────┤
│  Bottom Nav (mobile):                   │
│  Home | Deposit | History | Profile     │
└─────────────────────────────────────────┘
```

### 4.2 Staff/Admin Portal

```
┌──────┬──────────────────────────────────┐
│      │  Top Bar: Search | Notif | User  │
│ Side ├──────────────────────────────────┤
│ bar  │                                  │
│      │  Main Content                    │
│ Nav  │  (fluid width, max 1280px)      │
│      │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

### 4.3 Collector Portal (Mobile-Optimized)

```
┌─────────────────────────────────────────┐
│  Header: Company Logo | Collector Name  │
├─────────────────────────────────────────┤
│  Quick Actions:                         │
│  [Onboard Customer] [Assist Deposit]    │
├─────────────────────────────────────────┤
│  Today's Stats: 5 deposits | GHS 500   │
├─────────────────────────────────────────┤
│  Recent Activity List                   │
├─────────────────────────────────────────┤
│  Bottom Nav:                            │
│  Home | Customers | Deposits | Me       │
└─────────────────────────────────────────┘
```

---

## 5. Key Screen Designs

### 5.1 Customer Dashboard

```
┌─────────────────────────────────────────┐
│  👋 Good morning, Kwame                 │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Total Savings                  │    │
│  │  GHS 4,250.00                   │    │
│  │  ▲ GHS 100.00 today             │    │
│  │                                 │    │
│  │  [  💰 Make a Deposit  ]        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Quick Actions                          │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │Deposit │ │Withdraw│ │Statement│      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  Recent Transactions                    │
│  ┌─────────────────────────────────┐    │
│  │ ↑ GHS 100.00  MTN MoMo         │    │
│  │   Today, 9:30 AM    ✓ Complete │    │
│  ├─────────────────────────────────┤    │
│  │ ↑ GHS 50.00   MTN MoMo         │    │
│  │   Yesterday          ✓ Complete │    │
│  ├─────────────────────────────────┤    │
│  │ ↓ GHS 200.00  Withdrawal       │    │
│  │   Jun 15             ✓ Complete │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [View All Transactions →]              │
└─────────────────────────────────────────┘
```

### 5.2 Deposit Flow (3 Steps)

**Step 1: Amount**

```
┌─────────────────────────────────────────┐
│  ← Back          Make a Deposit         │
│                                         │
│  How much would you like to save?       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  GHS  [    100.00    ]          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Quick amounts:                         │
│  [GHS 10] [GHS 50] [GHS 100] [GHS 500] │
│                                         │
│  Savings Plan: Daily Susu (GHS 10/day)  │
│                                         │
│  [        Continue →          ]         │
└─────────────────────────────────────────┘
```

**Step 2: Payment Method**

```
┌─────────────────────────────────────────┐
│  ← Back          Payment Method          │
│                                         │
│  Depositing GHS 100.00                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📱 MTN Mobile Money        ✓   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 📱 Telecel Cash                 │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 💳 Visa / Mastercard            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  MoMo Number: +233 24 123 4567          │
│                                         │
│  [     Pay GHS 100.00 →       ]         │
└─────────────────────────────────────────┘
```

**Step 3: Confirmation**

```
┌─────────────────────────────────────────┐
│                                         │
│            ✅                           │
│     Deposit Successful!                 │
│                                         │
│  GHS 100.00 has been added to your      │
│  savings account.                       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Reference: TXN-20260618-ABC123  │    │
│  │ Date: Jun 18, 2026 9:30 AM       │    │
│  │ Method: MTN Mobile Money        │    │
│  │ New Balance: GHS 4,350.00       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Download Receipt]  [Share]            │
│                                         │
│  [        Back to Dashboard    ]        │
└─────────────────────────────────────────┘
```

### 5.3 Admin Dashboard

```
┌──────┬──────────────────────────────────────────────┐
│      │  ABC Susu Company           Admin Dashboard  │
│ 📊   ├──────────────────────────────────────────────┤
│ Dash ├──────────────────────────────────────────────┤
│      │                                              │
│ 👥   │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ Cust │  │ Deposits │ │Withdrawals│ │ Customers│    │
│      │  │ GHS 25K  │ │ GHS 5K   │ │  1,250   │    │
│ 💰   │  │ ▲ 12%    │ │ ▼ 3%     │ │ ▲ 8%     │    │
│ Trans├─│ └──────────┘ └──────────┘ └──────────┘    │
│      │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ 📋   │  │ Pending  │ │ Active   │ │ Revenue  │    │
│ With │  │ Withdr.  │ │ Collectors│ │ (Fees)   │    │
│      │  │    3     │ │    12    │ │ GHS 125  │    │
│ 📈   │  └──────────┘ └──────────┘ └──────────┘    │
│ Reprt│                                              │
│      │  Recent Transactions          Deposits Chart  │
│ ⚙️   │  ┌────────────────────┐  ┌──────────────┐   │
│ Sett │  │ TXN-... GHS 100 ✓ │  │ ████████     │   │
│      │  │ TXN-... GHS 50  ✓ │  │ ██████       │   │
│      │  │ TXN-... GHS 200 ✓ │  │ █████████    │   │
│      │  └────────────────────┘  └──────────────┘   │
└──────┴──────────────────────────────────────────────┘
```

### 5.4 Collector Assist Deposit

```
┌─────────────────────────────────────────┐
│  ← Back       Assist Deposit            │
│                                         │
│  Customer: Kwame Mensah                 │
│  Phone: +233 24 123 4567                │
│  Balance: GHS 4,250.00                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Amount: GHS [    50.00    ]    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Payment: MTN Mobile Money              │
│                                         │
│  ⚠️ Customer will receive a MoMo prompt │
│  on their phone. They must enter their  │
│  PIN to confirm. You cannot enter the   │
│  PIN for them.                          │
│                                         │
│  [   Send MoMo Prompt to Customer  ]    │
│                                         │
│  ── After initiation ──                 │
│                                         │
│  ⏳ Waiting for customer confirmation...│
│  ████████░░░░░░░ 60s remaining          │
│                                         │
│  [Cancel]                               │
└─────────────────────────────────────────┘
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width  | Layout                          |
| ---------- | ------ | ------------------------------- |
| `sm`       | 640px  | Single column, bottom nav       |
| `md`       | 768px  | Single column, optional sidebar |
| `lg`       | 1024px | Sidebar + main content          |
| `xl`       | 1280px | Full admin layout               |
| `2xl`      | 1536px | Max content width capped        |

---

## 7. Interaction Patterns

### Loading States

- Skeleton screens for data-heavy pages (dashboard, transaction lists)
- Button spinner for form submissions
- Optimistic updates for non-critical actions (mark notification read)

### Empty States

- Illustration + helpful message + CTA
- Example: "No transactions yet. Make your first deposit to start saving!"

### Error States

- Inline validation on forms (real-time)
- Toast notifications for API errors
- Full-page error for critical failures (500, network)

### Confirmation Patterns

- Destructive actions: confirmation dialog
- Financial actions: review screen before submission
- Withdrawals: amount + method + confirm dialog

---

## 8. Accessibility

| Requirement         | Implementation                                         |
| ------------------- | ------------------------------------------------------ |
| Color contrast      | 4.5:1 minimum for text                                 |
| Focus indicators    | Visible focus ring on all interactive elements         |
| Screen readers      | ARIA labels on icons, live regions for balance updates |
| Keyboard navigation | Full tab order, escape to close modals                 |
| Touch targets       | Minimum 44x44px on mobile                              |
| Motion              | `prefers-reduced-motion` respected                     |
| Language            | `lang="en"` with Ghana locale formatting               |

---

## 9. Currency & Locale Formatting

```typescript
// GHS formatting
const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
// Output: "GHS 1,000.00"

// Phone formatting
// Input: +233241234567
// Display: +233 24 123 4567

// Date formatting
// ISO: 2026-06-18T09:30:00Z
// Display: "Jun 18, 2026 at 9:30 AM"
```

---

## 10. Dark Mode

**Native customer app (`apps/mobile`):** Dark banking chrome is the **default** (`userInterfaceStyle: "dark"`, theme store). Users can switch to light in Appearance.

**Web product portals:** Theme tokens support light/dark via CSS variables / app shell.

**Marketing site (`apps/web` marketing routes):** OmniH-inspired photo heroes, floating pill nav, glass cards, and vision quotes under `apps/web/src/components/marketing/` (`photo-hero`, `glass-card`, `vision-quote-section`, etc.). Do not apply marketing atmosphere tokens to the native customer app or staff dashboards.

```css
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  /* ... */
}
```

---

_Document end. Next: Folder Structure → `07-folder-structure.md`_
