# SusuFlow Default Login Credentials

Save this file for quick reference when logging into SusuFlow admin dashboards and mobile portals.

## 🔐 Default Accounts & Passwords

| Role                      | Email                  | Password          | Susu Company / Tenant     | Dashboard Route        |
| :------------------------ | :--------------------- | :---------------- | :------------------------ | :--------------------- |
| **Super Admin**           | `admin@susuflow.com`   | `ChangeMe123!`    | _(Platform Admin - none)_ | `/admin`               |
| **Company Admin**         | `admin@abcsusu.com`    | `Admin123!@#`     | `abc-susu`                | `/staff/dashboard`     |
| **Company Admin (ADIPA)** | `steveamoah@gmail.com` | `Adipa123!@#`     | `adipa`                   | `/staff/dashboard`     |
| **Collector Agent**       | `nana@abcsusu.com`     | `Collector123!@#` | `abc-susu`                | `/collector/dashboard` |

---

## 🛠️ Environment Reference (.env)

- **Super Admin Email:** `admin@susuflow.com`
- **Super Admin Password:** `ChangeMe123!`
- **Default Tenant Slug:** `abc-susu`

## 📱 Mobile App Commands (Expo / React Native)

| Description                                     | Command                                      |
| :---------------------------------------------- | :------------------------------------------- |
| **Standard Mobile Dev Server**                  | `pnpm dev:mobile`                            |
| **Tunnel Mode (Physical iOS & Android Phones)** | `pnpm dev:mobile:tunnel`                     |
| **Run on Android Emulator**                     | `pnpm --filter @susuflow/mobile android`     |
| **Run on iOS Simulator (Mac)**                  | `pnpm --filter @susuflow/mobile ios`         |
| **Clear Expo Cache & Restart**                  | `pnpm --filter @susuflow/mobile start:clear` |

---

## 🔄 How to Reset Database / Re-seed

If credentials ever get lost or changed, reset the database seed by running:

```bash
pnpm --filter @susuflow/database seed
```
