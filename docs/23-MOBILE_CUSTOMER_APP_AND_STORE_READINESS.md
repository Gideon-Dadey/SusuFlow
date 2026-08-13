# SusuFlow — Mobile Customer App & Store Readiness

**Document reference:** `SusuFlow-MOBILE-STORE-2026`  
**Audience:** Mobile engineers, release managers, App Store / Play reviewers  
**Companion:** [`apps/mobile/README.md`](../apps/mobile/README.md)

---

## 1. Scope

The Expo customer app (`apps/mobile`) is a first-class client of the Nest API. It covers:

- Auth (register, verify, login, biometric re-login)
- Deposits & withdrawals (KYC-gated, offline-aware)
- Goals, activity / receipts, notifications
- Account, security (password, app lock, delete)
- In-app support (FAQ chat + human escalate)

Web portals remain in `apps/web`. Marketing site uses a separate OmniH-inspired photo/glass system under `apps/web/src/components/marketing/` — do **not** apply those tokens to the customer mobile chrome.

---

## 2. Architecture (short)

| Layer           | Choice                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime         | Expo SDK 54, Expo Router                                                                                   |
| State           | Zustand (`auth`, `theme`, `app-lock`, `toast`)                                                             |
| Data            | TanStack Query + `src/lib/api.ts`                                                                          |
| Secure storage  | `expo-secure-store` (tokens, app-lock PIN, biometric refresh session)                                      |
| Biometrics      | `expo-local-authentication`                                                                                |
| Crash reporting | `@sentry/react-native` via `src/lib/monitoring.ts` (DSN-gated)                                             |
| Analytics       | First-party `POST /analytics/events` + optional `EXPO_PUBLIC_ANALYTICS_KEY` (PostHog) + Sentry breadcrumbs |

Default theme is **dark** banking chrome (`theme.store`, `userInterfaceStyle: "dark"`). Users can switch to light in Appearance.

---

## 3. Money movement controls

### Deposit

- KYC gate before initiate
- Client sends `idempotencyKey` (`dep_…`) once per confirm intent; reused on retry
- Offline: primary CTA disabled + toast
- Errors via toast (not blocking `Alert`)

### Withdrawal

- KYC gate
- Client sends `idempotencyKey` (`wd_…`) to `POST /api/v1/withdrawals/request`
- API semantics (see [`05-api-specifications.md`](./05-api-specifications.md)):
  - Same key + same tenant/type/amount → return original transaction
  - Same key + conflicting payload → `409 Conflict`
- If app lock is enabled: biometric/PIN **step-up** before confirm (`useMoneyStepUp`)
- Offline: CTA disabled + toast

---

## 4. Security surfaces

| Feature         | Behavior                                                                    |
| --------------- | --------------------------------------------------------------------------- |
| App lock        | PIN in SecureStore; optional biometric unlock after background              |
| Biometric login | Stores **refresh token** only (never password); enroll after password login |
| Step-up         | Re-prompts lock biometrics/PIN before withdraw when lock is on              |
| Session         | Access + refresh tokens; refresh on 401; clear on logout/delete             |
| Monitoring      | `monitoring.captureException` on money failures; Sentry when DSN set        |

Routes:

- `/my-profile/security`
- `/my-profile/security-password`
- `/my-profile/security-lock`
- `/my-profile/security-delete`

Legacy `(tabs)/profile/*` detail screens redirect into `/my-profile/*`.

---

## 5. Support hub

| Route               | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `/support`          | Topic picker                                                   |
| `/support/chat`     | Keyword FAQ; refuses live balances/secrets                     |
| `/support/ticket`   | Create tracked in-app ticket (`POST /support/tickets`)         |
| `/support/tickets`  | List my tickets                                                |
| `/support/messages` | Tickets + email; WhatsApp/Call only if real numbers configured |

Escalate from chat: **Open a ticket** (primary — emails support + customer ack via worker) or WhatsApp/email deep-link.

Placeholder numbers (`+233302000000`, etc.) are treated as **unset** so fake contacts never ship.

---

## 6. Environment matrix

| Variable                     | Dev             | Preview / Production              |
| ---------------------------- | --------------- | --------------------------------- |
| `EXPO_PUBLIC_API_URL`        | LAN / localhost | HTTPS API host (required)         |
| `EXPO_PUBLIC_WEB_URL`        | LAN / localhost | HTTPS web host (required)         |
| `EXPO_PUBLIC_SUPPORT_*`      | Optional        | Real contacts in `eas.json`       |
| `EXPO_PUBLIC_SENTRY_DSN`     | Local `.env`    | **EAS secret** (all environments) |
| `EXPO_PUBLIC_ANALYTICS_KEY`  | Optional        | Optional PostHog project key      |
| `EXPO_PUBLIC_APP_ENV`        | `development`   | `preview` / `production`          |
| `SUPPORT_EMAIL` (API/worker) | Optional        | Inbox for ticket notifications    |

Outside `__DEV__`, missing API/web URLs **throw** at boot (fail closed). Dev may fall back to the shared Render API for Expo Go convenience.

---

## 7. Store submission gate

Operator checklist (also in `apps/mobile/src/lib/store-readiness.ts`):

1. Stop Metro → `pnpm install` (link `@sentry/react-native`)
2. Set `EXPO_PUBLIC_SENTRY_DSN` in EAS
3. Set real `EXPO_PUBLIC_SUPPORT_PHONE` + `EXPO_PUBLIC_SUPPORT_WHATSAPP`
4. Confirm production API/web hosts
5. Config gate: `pnpm smoke:store` (from `apps/mobile`)
6. `eas build --profile production`
7. **Device smoke** (required before public store): deposit, withdraw double-tap, Face ID login, offline CTA, support ticket, push
8. Store listing: privacy, terms, support URL
9. Confirm Android permissions exclude microphone (`RECORD_AUDIO` removed)

Automated tests: `pnpm test` in `apps/mobile` (idempotency, config, FAQ, app-lock PIN rules, analytics event names).

---

## 8. Related documents

| Doc                                                                                      | Why                                |
| ---------------------------------------------------------------------------------------- | ---------------------------------- |
| [`apps/mobile/README.md`](../apps/mobile/README.md)                                      | Local setup, Expo Go, EAS commands |
| [`05-api-specifications.md`](./05-api-specifications.md)                                 | Withdrawal request + idempotency   |
| [`11-security-audit.md`](./11-security-audit.md)                                         | Financial + mobile lock controls   |
| [`16-production-readiness.md`](./16-production-readiness.md)                             | Overall go-live gates              |
| [`21-PORTAL_AND_PAGE_BY_PAGE_USER_GUIDE.md`](./21-PORTAL_AND_PAGE_BY_PAGE_USER_GUIDE.md) | Native app route map               |

---

_Document end._
