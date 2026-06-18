#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCENARIO="${1:-smoke}"
BASE_URL="${BASE_URL:-http://localhost:4000}"

cd "$ROOT"

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 is required. Install: https://k6.io/docs/get-started/installation/"
  exit 1
fi

if ! curl -sf "${BASE_URL}/api/v1/health/live" >/dev/null; then
  echo "API not reachable at ${BASE_URL}"
  echo ""
  echo "Start the stack first:"
  echo "  pnpm docker:up"
  echo "  pnpm db:seed"
  echo "  THROTTLE_LIMIT=10000 THROTTLE_TTL_MS=60000 pnpm --filter @susuflow/api dev"
  exit 1
fi

SCRIPT="tests/load/${SCENARIO}.js"
if [[ ! -f "$SCRIPT" ]]; then
  echo "Unknown scenario: ${SCENARIO}"
  echo "Available: smoke, api-baseline, stress, deposit-init"
  exit 1
fi

echo "==> Running k6 scenario: ${SCENARIO}"
echo "    Target: ${BASE_URL}"
echo ""

export BASE_URL
export TENANT_SLUG="${TENANT_SLUG:-abc-susu}"
export LOAD_TEST_EMAIL="${LOAD_TEST_EMAIL:-nana@abcsusu.com}"
export LOAD_TEST_PASSWORD="${LOAD_TEST_PASSWORD:-Collector123!@#}"

k6 run "$SCRIPT"
