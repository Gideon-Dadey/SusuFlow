# 🚀 SusuFlow — Render.com One-Click Deployment Guide

**Document Reference**: `SusuFlow-RENDER-2026-GUIDE`  
**Target Audience**: DevOps Engineers, Developers, System Administrators

---

## 1. Overview

Render ([render.com](https://render.com)) provides zero-downtime, automated deployment for GitHub repositories.

SusuFlow includes an automated **`render.yaml` Blueprint file** at the root of the repository, enabling 1-click deployment for:

1. 🗄️ **PostgreSQL Managed Database** (`susuflow-db`)
2. ⚡ **Redis Key-Value Cache** (`susuflow-redis`)
3. ⚙️ **NestJS API Backend** (`susuflow-api`)
4. 💻 **Next.js 15 Web Portal** (`susuflow-web`)

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Sign in to Render

1. Visit **[https://dashboard.render.com](https://dashboard.render.com)**.
2. Sign in with your GitHub account.

---

### Step 2: Create New Blueprint Project

1. In the upper-right corner of the dashboard, click **`New +`** -> select **`Blueprint`**.
2. Connect your GitHub repository:
   ```text
   https://github.com/Gideon-Dadey/SusuFlow
   ```
3. Give your Blueprint instance a name (e.g. `susuflow-production`).

---

### Step 3: Auto-Discovery & Blueprint Apply

Render will automatically scan your repository, detect `render.yaml`, and present the 4 resources to be created:

- `susuflow-db` (PostgreSQL Database)
- `susuflow-redis` (Redis Cache)
- `susuflow-api` (NestJS Web Service)
- `susuflow-web` (Next.js Web Portal)

Click **`Apply`** to launch the automated build & provisioning pipeline.

---

### Step 4: Run Initial Database Seed (Optional)

Once `susuflow-api` and `susuflow-db` are live:

1. Open the `susuflow-api` service in Render Dashboard.
2. Click **`Shell`** tab.
3. Run the database seed command to seed initial admin accounts and demo data:
   ```bash
   pnpm db:push && pnpm db:seed
   ```

---

## 3. Environment Variables Reference

Render automatically links `DATABASE_URL` and `REDIS_URL` between services.

If you are setting environment variables manually on Render:

| Variable Name         | Description                     | Example Value                        |
| :-------------------- | :------------------------------ | :----------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string    | `postgres://user:pass@host/susuflow` |
| `REDIS_URL`           | Redis connection string         | `redis://red-xxx:6379`               |
| `JWT_SECRET`          | Secret key for JWT auth         | `auto-generated-by-render`           |
| `NEXT_PUBLIC_API_URL` | Public API URL for Web frontend | `https://susuflow-api.onrender.com`  |
| `PORT`                | API Server Port                 | `10000`                              |

---

## 4. Live URLs & Health Monitoring

- **API Health Check**: `https://susuflow-api.onrender.com/api/v1/health`
- **Swagger Documentation**: `https://susuflow-api.onrender.com/api/docs`
- **Web Portal**: `https://susuflow-web.onrender.com`
