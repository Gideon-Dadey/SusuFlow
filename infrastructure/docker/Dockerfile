# syntax=docker/dockerfile:1
# Multi-target Dockerfile for SusuFlow monorepo
# Usage: docker build -f infrastructure/docker/Dockerfile --target api .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/database/package.json packages/database/
COPY packages/shared/package.json packages/shared/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ENV DOCKER_BUILD=true
RUN pnpm db:generate
RUN pnpm --filter @susuflow/shared build
RUN pnpm --filter @susuflow/database build
RUN pnpm --filter @susuflow/api build
RUN pnpm --filter @susuflow/web build
RUN pnpm --filter @susuflow/worker build

# ─── API ───────────────────────────────────────────────────────────────────────
FROM build AS api-deploy
RUN pnpm deploy --filter=@susuflow/api --prod /prod/api

FROM node:20-alpine AS api
RUN apk add --no-cache openssl curl
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=api-deploy --chown=nestjs:nodejs /prod/api .
USER nestjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health/live || exit 1
CMD ["node", "dist/main.js"]

# ─── Web (Next.js standalone) ────────────────────────────────────────────────
FROM node:20-alpine AS web
RUN apk add --no-cache libc6-compat curl
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "apps/web/server.js"]

# ─── Worker ──────────────────────────────────────────────────────────────────
FROM build AS worker-deploy
RUN pnpm deploy --filter=@susuflow/worker --prod /prod/worker

FROM node:20-alpine AS worker
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 worker
COPY --from=worker-deploy --chown=worker:nodejs /prod/worker .
USER worker
CMD ["node", "dist/main.js"]
