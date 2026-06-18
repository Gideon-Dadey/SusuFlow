# SusuFlow — Deployment Guide

**Phase:** 14  
**Date:** June 2026

## Architecture Overview

```
                    ┌─────────────────────────────────────────┐
                    │              AWS (eu-west-1)            │
                    │                                         │
  Internet ────────►│  Route 53 / ACM / WAF (Phase 14+)      │
                    │         │                               │
                    │    ALB Ingress (EKS)                    │
                    │    ├── susuflow-web (Next.js)           │
                    │    └── susuflow-api (NestJS)            │
                    │                                         │
                    │    susuflow-worker (BullMQ)             │
                    │         │         │                     │
                    │    RDS PostgreSQL  ElastiCache Redis    │
                    │    (Multi-AZ prod) (replicated prod)    │
                    │                                         │
                    │    S3 (receipts, assets)                │
                    │    Secrets Manager (DB, Redis, app)     │
                    │    CloudWatch (logs, alarms)            │
                    └─────────────────────────────────────────┘
```

---

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Terraform | >= 1.6 |
| AWS CLI | v2 |
| kubectl | >= 1.29 |
| Helm | >= 3 (for ingress controller) |

AWS account with permissions for VPC, EKS, RDS, ElastiCache, S3, Secrets Manager, CloudWatch.

---

## 2. Terraform Structure

```
infrastructure/terraform/
├── modules/
│   ├── vpc/          # VPC, subnets, NAT, IGW
│   ├── eks/          # EKS cluster + node group
│   ├── rds/          # PostgreSQL 16 + Secrets Manager
│   ├── elasticache/  # Redis 7 + Secrets Manager
│   └── s3/           # Encrypted asset bucket
└── environments/
    ├── staging/      # Cost-optimized (single-AZ RDS, 1 Redis node)
    └── production/   # Multi-AZ RDS, 2 Redis nodes, 35-day backups
```

### Environment Comparison

| Resource | Staging | Production |
|----------|---------|------------|
| EKS nodes | 2× t3.medium | 3× t3.large (HPA 2–10) |
| RDS | db.t4g.medium, single-AZ | db.r6g.large, Multi-AZ |
| Redis | cache.t4g.micro, 1 node | cache.r6g.large, 2 nodes + TLS |
| S3 versioning | Off | On |
| Backup retention | 7 days | 35 days |
| Log retention | 30 days | 90 days (audit: 7 years) |

---

## 3. Provision Infrastructure

### 3.1 Configure Remote State (recommended)

Create S3 bucket and DynamoDB table for state locking:

```bash
aws s3api create-bucket \
  --bucket susuflow-terraform-state \
  --region eu-west-1 \
  --create-bucket-configuration LocationConstraint=eu-west-1

aws dynamodb create-table \
  --table-name susuflow-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

Uncomment the `backend "s3"` block in `environments/<env>/main.tf`.

### 3.2 Deploy Staging

```bash
cd infrastructure/terraform/environments/staging
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set aws_account_suffix

terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Or use the helper script:

```bash
chmod +x scripts/deploy-infrastructure.sh
./scripts/deploy-infrastructure.sh staging plan
./scripts/deploy-infrastructure.sh staging apply
```

### 3.3 Configure kubectl

```bash
aws eks update-kubeconfig --region eu-west-1 --name susuflow-staging-cluster
kubectl get nodes
```

---

## 4. Kubernetes Bootstrap

### 4.1 Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 4.2 Create Application Secrets

Pull connection strings from AWS Secrets Manager:

```bash
# Database
DB_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id susuflow-staging/database --query SecretString --output text)

# Redis
REDIS_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id susuflow-staging/redis --query SecretString --output text)

# App secrets (JWT, encryption key)
APP_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id susuflow-staging/app --query SecretString --output text)

kubectl create namespace susuflow-staging

kubectl create secret generic susuflow-secrets \
  -n susuflow-staging \
  --from-literal=DATABASE_URL=$(echo $DB_SECRET | jq -r .DATABASE_URL) \
  --from-literal=REDIS_URL=$(echo $REDIS_SECRET | jq -r .REDIS_URL) \
  --from-literal=JWT_SECRET=$(echo $APP_SECRET | jq -r .JWT_SECRET) \
  --from-literal=ENCRYPTION_KEY=$(echo $APP_SECRET | jq -r .ENCRYPTION_KEY)
```

### 4.3 Deploy Application

```bash
# Update image tags in kustomization or use CI deploy workflow
kubectl apply -k infrastructure/kubernetes/staging
kubectl rollout status deployment/susuflow-api -n susuflow-staging
```

### 4.4 Run Database Migrations

```bash
kubectl run prisma-migrate \
  --rm -i --restart=Never \
  -n susuflow-staging \
  --image=ghcr.io/<org>/<repo>/api:staging \
  --env-from=secret/susuflow-secrets \
  --command -- npx prisma migrate deploy
```

---

## 5. Production Deployment

Production uses tag-based releases (see `docs/13-cicd.md`):

```bash
# 1. Provision production infrastructure
./scripts/deploy-infrastructure.sh production apply

# 2. Bootstrap K8s (ingress, secrets, manifests)
kubectl apply -k infrastructure/kubernetes/production

# 3. Release application
git tag v1.0.0
git push origin v1.0.0
```

Production requires GitHub environment approval before deploy.

---

## 6. DNS & TLS

| Record | Target |
|--------|--------|
| `susuflow.com` | ALB / Ingress IP |
| `*.susuflow.com` | Wildcard for tenant subdomains |
| `api.susuflow.com` | API Ingress |

Use AWS Certificate Manager for TLS. Annotate ingress:

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
```

---

## 7. Observability

### CloudWatch Log Groups (created by Terraform)

| Log Group | Retention |
|-----------|-----------|
| `/susuflow/staging/api` | 30 days |
| `/susuflow/production/api` | 90 days |
| `/susuflow/production/audit` | 7 years |

### Alarms

| Alarm | Threshold |
|-------|-----------|
| API 5xx rate | > 5–10 per 5 min |
| RDS CPU | > 80% (production) |

Configure SNS topic subscriptions for on-call notifications.

### WAF (recommended for production)

Attach AWS WAF to ALB/CloudFront with:
- Rate limiting (1000 req/5 min per IP)
- AWS Managed Rules (Core rule set, Known bad inputs)
- Geo-blocking (optional)

---

## 8. Disaster Recovery

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| Pod failure | < 1 min | 0 | K8s auto-restart |
| Node failure | < 5 min | 0 | ASG replacement |
| RDS failure | < 4 h | 1 h | Multi-AZ failover (production) |
| Region outage | < 8 h | 1 h | Cross-region replica (Phase 4) |

**Point-in-time recovery:** RDS supports restore to any second within backup retention window.

---

## 9. Cost Estimates (Monthly, eu-west-1)

| Environment | Approx. Cost |
|-------------|-------------|
| Staging | $300–500 |
| Production (MVP) | $800–1,500 |

Largest drivers: EKS control plane ($73), NAT gateway ($45), RDS, ElastiCache.

---

## 10. Security Checklist

- [ ] Terraform state in encrypted S3 with DynamoDB locking
- [ ] All secrets in AWS Secrets Manager (never in K8s plaintext long-term)
- [ ] RDS and Redis in private subnets only
- [ ] EKS endpoint access restricted (consider private-only for production)
- [ ] S3 buckets block all public access
- [ ] IAM roles follow least-privilege
- [ ] WAF enabled on production ingress
- [ ] CloudWatch alarms wired to SNS/PagerDuty

---

## 11. Sign-Off

| Item | Status |
|------|--------|
| VPC module | ✅ |
| EKS module | ✅ |
| RDS PostgreSQL 16 | ✅ |
| ElastiCache Redis 7 | ✅ |
| S3 assets bucket | ✅ |
| Secrets Manager integration | ✅ |
| Staging environment | ✅ |
| Production environment | ✅ |
| CloudWatch logs/alarms | ✅ |
| Deploy scripts | ✅ |
| Terraform CI workflow | ✅ |
| WAF (live attach) | ⏳ Manual per account |
| Cross-region DR | ⏳ Phase 4 |

---

*Next: Phase 16 — Production Readiness Review → `16-production-readiness.md`*
