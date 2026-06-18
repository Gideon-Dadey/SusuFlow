# SusuFlow — Load Testing

**Phase:** 15  
**Date:** June 2026

## Objectives

Validate non-functional requirements from the PRD:

| Metric | Target | Test |
|--------|--------|------|
| API response time (p95) | < 200ms | `api-baseline.js` |
| Error rate | < 0.1% | All scenarios |
| Platform throughput | 500 TPS (production) | `stress.js` (staging/prod) |
| Health endpoint | < 100ms p95 | `api-baseline.js` health scenario |

---

## Tooling

**[Grafana k6](https://k6.io/)** — JavaScript-based load testing with threshold assertions.

```
tests/load/
├── lib/config.js       # Shared URLs, auth helpers, thresholds
├── smoke.js            # 5 VUs × 30s — CI / post-deploy smoke
├── api-baseline.js     # Multi-scenario PRD validation
├── stress.js           # Ramp to 200 VUs — breaking point analysis
└── deposit-init.js     # Deposit POST (requires CUSTOMER_ID)
```

---

## Prerequisites

1. **k6 installed** locally ([installation guide](https://k6.io/docs/get-started/installation/))
2. **API running** with database seeded (`pnpm db:seed`)
3. **Rate limits raised** for load tests (default 100 req/min is too low):

```bash
THROTTLE_LIMIT=10000 THROTTLE_TTL_MS=60000 pnpm --filter @susuflow/api dev
```

4. **Docker services** running (`pnpm docker:up`) for PostgreSQL + Redis

---

## Running Tests

### Quick smoke (recommended first run)

```bash
chmod +x scripts/run-load-tests.sh
./scripts/run-load-tests.sh smoke
```

### PRD baseline (p95 < 200ms)

```bash
./scripts/run-load-tests.sh api-baseline
```

### Stress test (staging only)

```bash
./scripts/run-load-tests.sh stress
```

### Deposit initiation (optional)

Requires an onboarded customer UUID:

```bash
CUSTOMER_ID=<uuid> ./scripts/run-load-tests.sh deposit-init
```

### Direct k6 invocation

```bash
k6 run tests/load/smoke.js
k6 run --env BASE_URL=https://api-staging.susuflow.com tests/load/smoke.js
```

---

## Scenarios

### smoke.js

| Setting | Value |
|---------|-------|
| VUs | 5 |
| Duration | 30s |
| Endpoints | health, customers list, deposits list |

Used for post-deploy verification and GitHub Actions `workflow_dispatch`.

### api-baseline.js

| Scenario | Executor | Load | p95 target |
|----------|----------|------|------------|
| health | constant-arrival-rate | 30 req/s | < 100ms |
| dashboard | ramping-vus | 0→50 | < 200ms |
| deposits | constant-vus | 5 VUs | < 250ms |

Auth token obtained once in `setup()` — login is not hammered (avoids auth rate limit).

### stress.js

Ramps 0 → 50 → 100 → 200 VUs over 6 minutes. Run against **staging** infrastructure only, not local dev.

### deposit-init.js

Tests `POST /api/v1/deposits` with mock Hubtel gateway (dev mode). Uses unique `idempotencyKey` per request.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:4000` | API origin |
| `TENANT_SLUG` | `abc-susu` | `x-tenant-slug` header |
| `LOAD_TEST_EMAIL` | `nana@abcsusu.com` | Collector login |
| `LOAD_TEST_PASSWORD` | `Collector123!@#` | Collector password |
| `CUSTOMER_ID` | — | Required for deposit-init |
| `THROTTLE_LIMIT` | `100` | Set on **API** process, not k6 |

---

## CI Integration

### GitHub Actions

`load-test.yml` — manual workflow:

1. Go to Actions → Load Test → Run workflow
2. Select scenario (`smoke`, `api-baseline`, `stress`)
3. Set `base_url` (staging API URL)

### Recommended gates

| When | Scenario | Environment |
|------|----------|-------------|
| Post-deploy staging | smoke | staging API |
| Pre-production release | api-baseline | staging API |
| Quarterly capacity review | stress | staging API |

---

## Interpreting Results

k6 prints a summary at the end:

```
✓ http_req_duration..............: avg=45ms  p(95)=120ms
✓ http_req_failed................: 0.00%
```

**Pass:** all `thresholds` show ✓  
**Fail:** any threshold shows ✗ — investigate slow queries, missing cache, or rate limits

### Common failures

| Symptom | Likely cause |
|---------|--------------|
| 429 responses | `THROTTLE_LIMIT` too low on API |
| 401 on protected routes | Token expired or wrong tenant slug |
| p95 > 200ms on dashboard | DB missing indexes, no Redis, cold start |
| Connection refused | API not running or wrong `BASE_URL` |

---

## Production TPS Target (500 TPS)

The PRD 500 TPS target is **platform-wide** and requires production infrastructure (EKS HPA, RDS Multi-AZ, ElastiCache). Validate with:

1. Deploy to staging (`docs/14-deployment.md`)
2. Run `stress.js` against staging URL
3. Monitor CloudWatch: API latency, RDS CPU, Redis connections
4. Scale EKS node group if p95 degrades before target RPS

Local dev is not expected to hit 500 TPS.

---

## Sign-Off

| Item | Status |
|------|--------|
| k6 smoke test | ✅ |
| API baseline multi-scenario | ✅ |
| Stress test script | ✅ |
| Deposit initiation test | ✅ |
| Configurable rate limits | ✅ |
| Run script + CI workflow | ✅ |
| 500 TPS on production infra | ⏳ Requires staging/prod run |

---

*Platform delivery complete → `16-production-readiness.md`*
