#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> SusuFlow setup"

command -v node >/dev/null || { echo "Node.js 20+ required"; exit 1; }
command -v pnpm >/dev/null || { echo "pnpm 9+ required"; exit 1; }

pnpm install

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

pnpm db:generate

if command -v docker >/dev/null; then
  pnpm docker:up
  echo "Waiting for PostgreSQL..."
  sleep 5
  pnpm --filter @susuflow/database exec prisma db push
  pnpm db:seed
else
  echo "Docker not found — skip database setup. Run pnpm docker:up manually."
fi

echo ""
echo "Setup complete. Start services:"
echo "  pnpm --filter @susuflow/api dev"
echo "  pnpm --filter @susuflow/worker dev"
echo "  pnpm dev:web"
