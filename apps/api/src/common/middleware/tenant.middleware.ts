import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../cache/cache.service";
import {
  TENANT_CACHE_PREFIX,
  TENANT_CACHE_TTL_SECONDS,
} from "../../cache/cache.constants";
import { TenantContext } from "@susuflow/shared";

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

type CachedTenant = Pick<TenantContext, "id" | "slug" | "name" | "status">;

function requestPath(req: Request): string {
  const raw = req.originalUrl || req.url || req.path || "";
  return raw.split("?")[0];
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const path = requestPath(req);
    const skipPaths = [
      "/api/health",
      "/api/docs",
      "/api/v1/admin",
      "/api/v1/webhooks",
    ];
    if (skipPaths.some((p) => path.startsWith(p))) {
      return next();
    }

    const tenantHeader = req.headers["x-tenant-slug"] as string;
    const host = req.headers.host || "";
    const subdomain = tenantHeader || host.split(".")[0];

    if (!subdomain || subdomain === "localhost:4000" || subdomain === "api") {
      return next();
    }

    const cacheKey = `${TENANT_CACHE_PREFIX}${subdomain}`;
    let tenant = await this.cache.get<CachedTenant>(cacheKey);

    if (!tenant) {
      tenant = await this.prisma.tenant.findUnique({
        where: { slug: subdomain },
        select: { id: true, slug: true, name: true, status: true },
      });

      if (tenant) {
        await this.cache.set(cacheKey, tenant, TENANT_CACHE_TTL_SECONDS);
      }
    }

    if (!tenant) {
      const tenantOptionalPaths = [
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
      ];
      if (tenantOptionalPaths.some((p) => path.startsWith(p))) {
        return next();
      }
      throw new NotFoundException(`Tenant '${subdomain}' not found`);
    }

    if (tenant.status === "suspended" || tenant.status === "closed") {
      throw new NotFoundException(`Tenant '${subdomain}' is not active`);
    }

    req.tenant = tenant;
    await this.prisma.setTenantContext(tenant.id);
    next();
  }
}
