# SusuFlow — CI/CD Pipeline

**Phase:** 13  
**Date:** June 2026

## Pipeline Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  PR / Push  │────►│  CI Workflow │────►│ Docker Build│────►│ GHCR Images  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                           │                                        │
                           ▼                                        ▼
                    lint → test → build                    deploy-staging (develop)
                                                           deploy-production (v*.*.*)
```

---

## 1. Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR + push to `main`/`develop` | Lint, test, build, Docker verify |
| `security-scan.yml` | PR + weekly cron | Dependency audit, secret scan, security tests |
| `deploy-staging.yml` | Push to `develop` | Build/push images, optional K8s deploy |
| `deploy-production.yml` | Tag `v*.*.*` | Build/push versioned images, optional K8s deploy |
| `dependabot.yml` | Weekly | Automated dependency PRs |

### CI Job Graph

1. **lint** — TypeScript check across api, web, shared, worker, database
2. **test** — Unit tests + e2e (PostgreSQL + Redis services)
3. **build** — Full monorepo `pnpm build`
4. **docker** — Build all three images (no push)

---

## 2. Docker Images

Multi-target Dockerfile at `infrastructure/docker/Dockerfile`:

```bash
# Build locally
docker build -f infrastructure/docker/Dockerfile --target api -t susuflow/api:local .
docker build -f infrastructure/docker/Dockerfile --target web -t susuflow/web:local .
docker build -f infrastructure/docker/Dockerfile --target worker -t susuflow/worker:local .
```

| Image | Port | Base |
|-------|------|------|
| `api` | 4000 | Node 20 Alpine + pnpm deploy |
| `web` | 3000 | Next.js standalone output (`DOCKER_BUILD=true`) |
| `worker` | — | Node 20 Alpine + pnpm deploy |

Images are published to **GitHub Container Registry** (GHCR):
```
ghcr.io/<org>/<repo>/api:staging-<sha>
ghcr.io/<org>/<repo>/api:v1.0.0
```

---

## 3. Deployment

### Staging (automatic image publish)

- **Trigger:** merge to `develop`
- **Images:** tagged `staging` and `staging-<sha>`
- **K8s deploy:** gated by repository variable `ENABLE_K8S_DEPLOY=true`

### Production (tag-based release)

```bash
git tag v1.0.0
git push origin v1.0.0
```

- **Images:** tagged with semver (`v1.0.0`, `1.0`, `latest`)
- **K8s deploy:** requires `production` environment approval + secrets

### Required Secrets & Variables

| Name | Type | Purpose |
|------|------|---------|
| `ENABLE_K8S_DEPLOY` | Variable | `true` to enable kubectl deploy jobs |
| `KUBE_CONFIG_STAGING` | Secret | Base64-encoded kubeconfig for staging |
| `KUBE_CONFIG_PRODUCTION` | Secret | Base64-encoded kubeconfig for production |
| `GITHUB_TOKEN` | Auto | GHCR push (provided by Actions) |

### Kubernetes Secrets (create manually per cluster)

```bash
kubectl create secret generic susuflow-secrets \
  -n susuflow-staging \
  --from-literal=DATABASE_URL=... \
  --from-literal=REDIS_URL=... \
  --from-literal=JWT_SECRET=... \
  --from-literal=ENCRYPTION_KEY=...
```

---

## 4. Kubernetes Manifests

```
infrastructure/kubernetes/
├── base/           # Shared deployments, services, ingress, HPA
├── staging/        # 1 replica, staging URLs
└── production/     # 2 replicas (HPA 2–10), production URLs
```

Apply locally:
```bash
kubectl apply -k infrastructure/kubernetes/staging
kubectl apply -k infrastructure/kubernetes/production
```

---

## 5. Branch Strategy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production-ready code | Tag release → production |
| `develop` | Integration branch | Auto → staging images |
| `feature/*` | Feature work | CI only |

---

## 6. Quality Gates

All PRs must pass before merge:

| Gate | Command / Workflow |
|------|-------------------|
| TypeScript | `pnpm lint` |
| Unit tests | `pnpm test` |
| E2E tests | `pnpm test:e2e` |
| Build | `pnpm build` |
| Docker build | `ci.yml` docker job |
| Security scan | `security-scan.yml` |
| Dependency audit | `pnpm audit --audit-level=high` |

---

## 7. Local CI Simulation

```bash
# Full local check (matches CI)
pnpm install --frozen-lockfile
pnpm db:generate
pnpm lint
pnpm test
pnpm test:e2e
pnpm build

# Docker build test
docker build -f infrastructure/docker/Dockerfile --target api .
```

---

## 8. Database Migrations in CI/CD

- **CI:** `prisma db push` validates schema against PostgreSQL 16
- **Production:** Run `prisma migrate deploy` as a pre-deploy job (Phase 14)

---

## 9. Sign-Off

| Item | Status |
|------|--------|
| CI pipeline (lint/test/build) | ✅ |
| Docker multi-target builds | ✅ |
| GHCR publish workflows | ✅ |
| Kubernetes base manifests | ✅ |
| Staging deploy workflow | ✅ |
| Production tag deploy | ✅ |
| Dependabot | ✅ |
| PR template + CODEOWNERS | ✅ |
| Terraform / EKS provisioning | ✅ |
| WAF / CloudWatch alerts | ✅ (alarms + logs; WAF attach manual) |
| Production readiness review | ✅ `16-production-readiness.md` |

---

*Next: Phase 15 — Load Testing → `15-load-testing.md`*
