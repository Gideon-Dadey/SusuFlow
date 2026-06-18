#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-staging}"
ACTION="${2:-plan}"
TF_DIR="$(cd "$(dirname "$0")/../infrastructure/terraform/environments/${ENVIRONMENT}" && pwd)"

if [[ ! -d "$TF_DIR" ]]; then
  echo "Unknown environment: $ENVIRONMENT (expected staging or production)"
  exit 1
fi

if [[ ! -f "$TF_DIR/terraform.tfvars" ]]; then
  echo "Missing $TF_DIR/terraform.tfvars"
  echo "Copy terraform.tfvars.example and fill in values first."
  exit 1
fi

cd "$TF_DIR"

echo "==> Terraform ${ACTION} for ${ENVIRONMENT}"
terraform init
terraform fmt -check -recursive ../../

case "$ACTION" in
  plan)
    terraform plan -out=tfplan
    ;;
  apply)
    terraform apply tfplan
    echo ""
    echo "==> Post-apply"
    terraform output configure_kubectl
    ;;
  destroy)
    terraform destroy
    ;;
  *)
    echo "Usage: $0 [staging|production] [plan|apply|destroy]"
    exit 1
    ;;
esac
