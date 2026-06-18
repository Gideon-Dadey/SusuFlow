#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo "========================================"
echo "  SusuFlow Pre-Deploy Check"
echo "========================================"
echo ""

echo "→ Lint"
pnpm lint || fail "Lint failed"
pass "Lint"

echo "→ Unit tests"
pnpm test || fail "Unit tests failed"
pass "Unit tests"

echo "→ E2E tests"
pnpm test:e2e || fail "E2E tests failed"
pass "E2E tests"

echo "→ Build"
pnpm build || fail "Build failed"
pass "Build"

echo "→ Secret pattern scan"
PATTERNS='(JWT_SECRET=.{8,}|password_hash.*=.*[^*])'
if git grep -iE "$PATTERNS" -- ':!*.md' ':!*.example' ':!*spec.ts' ':!*test.ts' ':!.github/**' ':!docs/**' 2>/dev/null; then
  fail "Potential secret patterns found in source"
fi
pass "No obvious secrets in source"

echo "→ .env.example completeness"
for var in DATABASE_URL JWT_SECRET REDIS_URL ENCRYPTION_KEY; do
  grep -q "^${var}=" .env.example || fail "Missing ${var} in .env.example"
done
pass "Required env vars documented"

echo ""
echo "========================================"
echo -e "${GREEN}All pre-deploy checks passed.${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Review docs/16-production-readiness.md go-live gates"
echo "  2. Deploy staging: ./scripts/deploy-infrastructure.sh staging apply"
echo "  3. Smoke test: ./scripts/run-load-tests.sh smoke"
