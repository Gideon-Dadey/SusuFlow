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

**iPhone won't open the app but Android works:** You are probably running Expo with `--offline`. iOS Expo Go **requires** a signed manifest and will fail with:

`Offline and no cached development certificate found, unable to sign manifest`

Stop the server (`Ctrl+C`) and start **without** `--offline`:

```bash
pnpm dev:mobile
```

If same Wi‑Fi still fails on iPhone, use tunnel mode:

```bash
pnpm dev:mobile:tunnel
```

**Never use `--offline` for iPhone testing** — Android may still bundle, but iOS will not connect.

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

## Production builds (EAS)

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login`
3. Link project: `eas init` (from `apps/mobile`)
4. Set secrets in the [Expo dashboard](https://expo.dev) or `eas.json` env for:
   - `EXPO_PUBLIC_API_URL` — HTTPS API (e.g. `https://api.susuflow.com`)
   - `EXPO_PUBLIC_WEB_URL` — web app (e.g. `https://susuflow.com`)
5. Build:
   ```bash
   pnpm --filter @susuflow/mobile build:preview    # internal testing
   pnpm --filter @susuflow/mobile build:production
   ```
6. Submit to stores (configure Apple/Google credentials interactively via `eas submit`):
   ```bash
   pnpm --filter @susuflow/mobile submit:production
   ```

## Push notifications

Background payment and security alerts use Expo Push (FCM / APNs under the hood). The **worker must be running** (`pnpm dev` includes it).

1. Open the app on a **physical phone** (simulators cannot receive push).
2. Sign in, allow notifications when prompted.
3. More → Notifications → **Send test notification**, then leave the app.
4. A real deposit confirmation, failed payment, payout, KYC decision, or new sign-in will also wake the phone.

Expo Go can register a token without a custom EAS project. Production / development builds need `eas init` plus `EXPO_PUBLIC_EAS_PROJECT_ID` (or the UUID written into `app.json`). Optional server env: `EXPO_ACCESS_TOKEN` for higher Expo rate limits.

## Production checklist

Before shipping to real users:

- [ ] `eas init` linked to your Expo account (updates `app.json` `projectId`)
- [ ] EAS env: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WEB_URL`, `EXPO_PUBLIC_EAS_PROJECT_ID`, optional support contacts
- [ ] API + worker deployed; `EXPO_ACCESS_TOKEN` set in production
- [ ] FCM (Android) and APNs (iOS) credentials uploaded in the Expo dashboard
- [ ] Test: login → allow notifications → send test alert while the app is closed → deposit confirmed push → tap opens the receipt
- [ ] Test full flows: register → verify → login → deposit → withdraw → logout → biometric login
- [ ] Store listings: privacy policy, terms, support URL (linked from Profile → About)

## Tests

```bash
pnpm --filter @susuflow/mobile test
pnpm --filter @susuflow/mobile lint
```
