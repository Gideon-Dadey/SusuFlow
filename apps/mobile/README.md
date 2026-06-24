# SusuFlow Mobile (Customer App)

React Native + Expo customer portal aligned with the desktop web app.

## Prerequisites

- Node 20+
- pnpm 9+
- [Expo Go](https://expo.dev/go) on your phone, or Android Studio / Xcode simulator
- API running: `pnpm dev:api`

## Setup

```bash
# From repo root
cp apps/mobile/.env.example apps/mobile/.env
pnpm install
pnpm --filter @susuflow/shared build
```

Mobile imports use `@susuflow/shared/client` (no Node.js `crypto` / server-only code).

Edit `apps/mobile/.env`:

| Environment      | `EXPO_PUBLIC_API_URL`    |
| ---------------- | ------------------------ |
| iOS Simulator    | `http://localhost:4000`  |
| Android Emulator | `http://10.0.2.2:4000`   |
| Physical device  | `http://YOUR_PC_IP:4000` |

## Connect on iPhone (Expo Go)

Expo Go does **not** list your project automatically on iOS in most cases. Use one of these:

### Option A — Scan QR (recommended)

1. Run `pnpm dev:mobile` on your PC.
2. On iPhone, open the **Camera** app (not Expo Go first).
3. Point at the **QR code in the terminal** → tap the banner → opens in Expo Go.

### Option B — Enter URL manually

1. Open **Expo Go** → **Enter URL manually** (or Connect → Manual).
2. Type exactly what the terminal shows, e.g. `exp://192.168.29.80:8083`

### Option C — Same Wi‑Fi still not working?

Your router may block phone-to-PC traffic. Use tunnel mode instead:

```bash
pnpm --filter @susuflow/mobile start:tunnel
```

Scan the new QR code (slower but works across networks).

**Requirements:** iPhone and PC on the **same Wi‑Fi**. Allow Node.js through **Windows Firewall** if prompted.

## Troubleshooting

**Project not showing inside Expo Go home screen:** Normal on iOS — scan the terminal QR or enter the `exp://` URL manually.

**`Body has already been read` on start:** Run `pnpm dev:mobile` again; if it persists, use `start:tunnel` instead.

**Port 8083 in use:** Stop other Expo terminals (`Ctrl+C`), then restart.

**Alternative (no phone):** press `w` in the Expo terminal to open the app in your browser.

```bash
# Mobile only
pnpm dev:mobile

# Desktop (web + API + worker)
pnpm dev

# Everything: run in two terminals
pnpm dev          # web + API
pnpm dev:mobile   # Expo
```

Scan the QR code with Expo Go, or press `a` (Android) / `i` (iOS).

## Customer test login

- Tenant: `apex-susu`
- Email: `apex.customer@gmail.com`
- Password: `123456`

## Screens (parity with web customer portal)

- Home dashboard (balance, quick actions, recent transactions)
- Deposit (MoMo)
- Withdraw
- Savings goals
- Profile & password
- Transaction history
