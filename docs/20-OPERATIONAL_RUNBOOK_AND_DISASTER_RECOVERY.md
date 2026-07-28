# 🚨 SusuFlow — Operational Incident Runbook & Disaster Recovery Manual

**Document Reference**: `SusuFlow-RUNBOOK-2026`  
**Target Audience**: DevOps Engineers, Site Reliability Engineers (SREs), System Administrators

---

## 1. Emergency Procedures & Response Levels

| Severity Level               | Response Time   | Description                                                                       | Lead Action                                           |
| :--------------------------- | :-------------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------- |
| **SEV-1 (Critical Outage)**  | &lt; 5 minutes  | Complete API down, payment gateway webhooks failing, database unreachable.        | Trigger failover, notify CTO, post status page alert. |
| **SEV-2 (High Degradation)** | &lt; 15 minutes | Redis worker queue backing up, SMS notifications delayed, partial latency spikes. | Scale background workers, inspect slow query logs.    |
| **SEV-3 (Minor Issue)**      | &lt; 2 hours    | Non-critical UI glitch, report export timeout.                                    | Schedule fix in sprint queue.                         |

---

## 2. Disaster Recovery Scenarios & Commands

### 2.1 Database Unreachability / Recovery

If PostgreSQL primary instance crashes:

```bash
# 1. Check container/pod health
docker ps | grep postgres

# 2. Inspect database logs
docker logs susuflow-postgres --tail 100

# 3. Promote Read-Replica to Primary (Kubernetes / AWS RDS)
aws rds failover-db-instance --db-instance-identifier susuflow-db-prod --target-db-instance-identifier susuflow-db-prod-replica

# 4. Verify Prisma migration & database connectivity
pnpm --filter @susuflow/database exec prisma db execute --stdin < check-health.sql
```

### 2.2 Payment Gateway Outage Failover (Hubtel -> Paystack)

If Hubtel Mobile Money API experiences downtime:

1. Open Admin Configuration Panel (`/admin/dev-ops` or `/staff/settings`).
2. Toggle Primary Gateway Provider from `Hubtel` to `Paystack` or `Direct Bank API`.
3. Save configuration. NestJS API updates Redis config cache within 500ms without requiring server restarts.

### 2.3 Clearing Stuck BullMQ Job Queues

If Redis queue accumulates un-processed jobs:

```bash
# Connect to Redis container
docker exec -it susuflow-redis redis-cli

# Check queue size
LLEN bull:deposit-reconciliation-queue:wait

# Flush stuck queue (emergency only)
DEL bull:deposit-reconciliation-queue:wait
```

---

## 3. Disaster Backup & Restoration Verification

- **Automated Daily Backups**: Automated PostgreSQL WAL archival every 15 minutes to encrypted AWS S3 bucket.
- **Monthly Dry-Run Restoration Test**: System administrators perform a automated restoration to isolated staging environment on the 1st of every month to verify backup integrity.
