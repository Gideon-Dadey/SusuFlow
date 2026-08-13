# SusuFlow Mobile (Customer App)

React Native + Expo customer app for deposits, withdrawals, goals, activity, and support.

Full product/ops reference: [`docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md`](../../docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md).

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

```bash
pnpm --filter @susuflow/mobile start:tunnel
```

**Requirements:** iPhone and PC on the **same Wi‑Fi**. Allow Node.js through **Windows Firewall** if prompted.

## Troubleshooting

**iPhone won't open the app but Android works:** Do **not** use `--offline`. iOS Expo Go needs a signed manifest.

```bash
pnpm dev:mobile
# or
pnpm dev:mobile:tunnel
```

**`Body has already been read` on start:** Restart; if it persists, use tunnel mode.

**Port 8083 in use:** Stop other Expo terminals (`Ctrl+C`), then restart.

**JavaScript heap OOM while bundling:** Restart with more memory:

```bash
NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter @susuflow/mobile start
```

**`pnpm install` EPERM on Windows:** Stop Expo/Metro first (it locks `node_modules`), then reinstall.

## Run

```bash
pnpm dev:mobile          # LAN
pnpm dev:mobile:tunnel   # Tunnel for phones across networks
pnpm --filter @susuflow/mobile lint
pnpm --filter @susuflow/mobile test
```

## Customer test login

- Tenant: `apex-susu` (or your seeded tenant, e.g. `adipa`)
- Email: `apex.customer@gmail.com`
- Password: `123456`

## Screens

| Area    | Routes / notes                                                                                |
| ------- | --------------------------------------------------------------------------------------------- |
| Tabs    | Home, Deposit, Withdraw, Goals, Activity, More                                                |
| Support | `/support`, `/support/chat` (FAQ), `/support/ticket`, `/support/tickets`, `/support/messages` |
| Profile | `/my-profile/*` — account, KYC, security (password, app lock, delete)                         |
| Money   | Offline disables deposit/withdraw CTAs; withdraw uses step-up + idempotency key               |
| Auth    | Email/password + optional Face ID / fingerprint login after enroll                            |

## Environment & EAS secrets

| Variable                       | Where                         | Notes                                                      |
| ------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`          | `.env` / `eas.json`           | Required outside `__DEV__`                                 |
| `EXPO_PUBLIC_WEB_URL`          | `.env` / `eas.json`           | Terms / privacy links                                      |
| `EXPO_PUBLIC_APP_ENV`          | `eas.json`                    | `development` / `preview` / `production`                   |
| `EXPO_PUBLIC_SUPPORT_EMAIL`    | `eas.json`                    | Always shown                                               |
| `EXPO_PUBLIC_SUPPORT_PHONE`    | `eas.json`                    | Real number only; placeholders hide Call                   |
| `EXPO_PUBLIC_SUPPORT_WHATSAPP` | `eas.json`                    | Digits for `wa.me`; placeholders hide WhatsApp             |
| `EXPO_PUBLIC_SENTRY_DSN`       | **EAS secret** + local `.env` | Never commit; monitoring idle without DSN                  |
| `EXPO_PUBLIC_ANALYTICS_KEY`    | optional                      | PostHog key; first-party events always post when logged in |
| `EXPO_PUBLIC_EAS_PROJECT_ID`   | `app.json` / env              | Push + EAS                                                 |

See `.env.example`, `eas.json`, and `src/lib/store-readiness.ts`.

Set a secret:

```bash
eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://...@o....ingest.sentry.io/..." \
  --environment production --visibility plaintext
```

## Production builds (EAS)

```bash
npm i -g eas-cli
eas login
# from apps/mobile
pnpm --filter @susuflow/mobile smoke:store
pnpm --filter @susuflow/mobile build:preview
pnpm --filter @susuflow/mobile build:production
pnpm --filter @susuflow/mobile submit:production
```

## Push notifications

Background payment and security alerts use Expo Push (FCM / APNs). The **worker must be running**.

1. Open the app on a **physical phone**.
2. Sign in, allow notifications.
3. More → Notifications → **Send test notification**, then leave the app.

## Store readiness checklist

Before App Store / Play Store submit:

- [ ] `pnpm install` (includes `@sentry/react-native`)
- [ ] EAS secret `EXPO_PUBLIC_SENTRY_DSN`
- [ ] Real support phone + WhatsApp (not placeholders)
- [ ] Prod/preview `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_WEB_URL` resolve
- [ ] `pnpm smoke:store` passes
- [ ] Privacy / terms / support URL on store listing
- [ ] Android permissions: biometric only — **no** `RECORD_AUDIO`
- [ ] Dark banking chrome default; Appearance can switch light
- [ ] Device smoke: register → verify → login → biometric enroll → deposit → withdraw (double-tap safe) → app lock → **in-app ticket** → logout → biometric login
- [ ] Push: closed-app deposit confirmation + tap opens receipt

## Tests

```bash
pnpm --filter @susuflow/mobile test
pnpm --filter @susuflow/mobile lint
pnpm --filter @susuflow/mobile smoke:store
```
