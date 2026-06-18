# Incident Response Runbook

**SusuFlow Operations**  
**Version:** 1.0  
**Last updated:** June 2026

---

## Severity Levels

| Level | Description | Response time | Examples |
|-------|-------------|---------------|----------|
| **SEV-1** | Platform down or data breach | 15 min | API unreachable, suspected breach |
| **SEV-2** | Major feature broken | 1 hour | Deposits failing, auth broken |
| **SEV-3** | Degraded performance | 4 hours | High latency, partial errors |
| **SEV-4** | Minor issue | Next business day | UI glitch, non-critical bug |

---

## On-Call First Steps

1. **Acknowledge** the alert in PagerDuty / Slack `#incidents`
2. **Assess severity** using table above
3. **Check health endpoints:**
   ```bash
   curl https://api.susuflow.com/api/v1/health
   kubectl get pods -n susuflow-production
   ```
4. **Open incident channel:** `#incident-YYYY-MM-DD-short-description`
5. **Assign roles:** Incident Commander, Communications, Technical Lead

---

## Common Scenarios

### API returning 5xx

```bash
# Check pod status
kubectl get pods -n susuflow-production
kubectl logs deployment/susuflow-api -n susuflow-production --tail=100

# Check RDS
aws rds describe-db-instances --db-instance-identifier susuflow-production-postgres

# Rollback if recent deploy
kubectl rollout undo deployment/susuflow-api -n susuflow-production
```

### Deposits not confirming

1. Check Hubtel dashboard for payment status
2. Verify webhook endpoint: `POST /api/v1/webhooks/hubtel`
3. Check worker logs: `kubectl logs deployment/susuflow-worker -n susuflow-production`
4. Inspect `payments` table for stuck `pending` status
5. **Do not** manually credit wallets without gateway confirmation

### Database connection errors

1. Verify RDS instance status in AWS Console
2. Check security group allows EKS node SG on port 5432
3. Verify `DATABASE_URL` in `susuflow-secrets`
4. If RDS failover in progress, wait for Multi-AZ recovery (~60–120s)

### Redis / queue backlog

1. Check ElastiCache cluster health
2. Monitor BullMQ queue depth in worker logs
3. Scale worker replicas: `kubectl scale deployment/susuflow-worker --replicas=3`

### Suspected security breach

1. **SEV-1** — page Security Lead immediately
2. Rotate `JWT_SECRET`, `ENCRYPTION_KEY`, database password via Secrets Manager
3. Force logout: invalidate all refresh tokens in DB
4. Preserve logs — do not delete CloudWatch log groups
5. Document timeline for forensic review

---

## Communication Templates

### Internal (SEV-1/2)

```
INCIDENT [SEV-X]: <title>
Status: Investigating | Identified | Monitoring | Resolved
Impact: <who is affected>
ETA: <next update time>
IC: <name>
```

### Customer-facing (if tenant-wide outage)

```
We are aware of an issue affecting deposit processing and are working to resolve it.
Your funds are secure. We will update you within 30 minutes.
```

---

## Post-Incident

Within 48 hours of resolution:

1. Write blameless post-mortem (`docs/incidents/YYYY-MM-DD-title.md`)
2. Document root cause, timeline, action items
3. Create GitHub issues for preventive fixes
4. Update this runbook if new scenario discovered

---

## Escalation Contacts

| Role | Contact |
|------|---------|
| On-call engineer | _Configure in PagerDuty_ |
| Engineering Lead | _Configure_ |
| Security Lead | _Configure_ |
| Hubtel support | support@hubtel.com |

---

## Useful Commands

```bash
# EKS context
aws eks update-kubeconfig --region eu-west-1 --name susuflow-production-cluster

# Tail API logs (CloudWatch)
aws logs tail /susuflow/production/api --follow

# Database read-only check
kubectl run psql-check --rm -i --restart=Never \
  --image=postgres:16-alpine -n susuflow-production \
  --env-from=secret/susuflow-secrets \
  --command -- psql "$DATABASE_URL" -c "SELECT 1"

# Recent deployments
kubectl rollout history deployment/susuflow-api -n susuflow-production
```
