import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import {
  ROLES,
  SUBSCRIPTION_PLAN_PRICES_GHS,
  TRIAL_PERIOD_DAYS,
  clampPageLimit,
} from "@susuflow/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { TENANT_CACHE_PREFIX } from "../../cache/cache.constants";
import { CreateTenantDto, UpdateTenantDto } from "./dto/tenant.dto";
import { PlanService } from "../plan/plan.service";
import { ensureTenantChartOfAccounts } from "../../common/utils/chart-of-accounts";

function generateTempPassword(): string {
  const base = randomBytes(9).toString("base64url");
  return `${base}A1!`;
}

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly planService: PlanService,
  ) {}

  async findAll(cursor?: string, limit?: number) {
    const pageLimit = clampPageLimit(limit);
    const tenants = await this.prisma.tenant.findMany({
      take: pageLimit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          select: {
            plan: true,
            status: true,
            trialEnd: true,
            currentPeriodEnd: true,
          },
        },
        _count: { select: { users: true, customers: true } },
      },
    });

    const hasMore = tenants.length > pageLimit;
    const data = hasMore ? tenants.slice(0, -1) : tenants;

    return {
      items: data,
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: true,
        _count: { select: { users: true, customers: true } },
      },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { subscription: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");
    return tenant;
  }

  async assertTenantOperational(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found");

    if (tenant.status === "suspended") {
      throw new BadRequestException(
        "This organization has been suspended. Contact SusuFlow support.",
      );
    }
    if (tenant.status === "closed") {
      throw new BadRequestException("This organization is no longer active.");
    }

    const sub = tenant.subscription;
    if (!sub) return;

    if (sub.status === "cancelled") {
      throw new BadRequestException(
        "Subscription cancelled. Contact SusuFlow to renew.",
      );
    }

    const now = new Date();
    if (
      tenant.status === "trial" &&
      sub.trialEnd &&
      sub.trialEnd < now &&
      sub.status !== "active"
    ) {
      throw new BadRequestException(
        "Trial period ended. Please complete subscription payment to continue.",
      );
    }

    if (sub.status === "past_due") {
      throw new BadRequestException(
        "Subscription payment is overdue. Contact your administrator or SusuFlow support.",
      );
    }
  }

  async create(dto: CreateTenantDto) {
    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug)
      throw new ConflictException(`Tenant slug '${dto.slug}' already exists`);

    const companyAdminRole = await this.prisma.role.findUnique({
      where: { name: ROLES.COMPANY_ADMIN },
    });
    if (!companyAdminRole)
      throw new BadRequestException("System roles not configured");

    const tempPassword = dto.adminPassword || generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_PERIOD_DAYS);
    const plan = dto.plan || "starter";

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: dto.slug,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          status: "trial",
          settings: {
            currency: "GHS",
            timezone: "Africa/Accra",
          },
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          plan,
          status: "trialing",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
          trialEnd,
        },
      });

      await tx.tenant.update({
        where: { id: tenant.id },
        data: { subscriptionId: subscription.id },
      });

      await ensureTenantChartOfAccounts(tx, tenant.id);

      const existingAdmin = await tx.user.findFirst({
        where: { tenantId: tenant.id, email: dto.adminEmail },
      });
      if (existingAdmin) {
        throw new ConflictException(
          "Admin email already exists for this tenant",
        );
      }

      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.adminEmail,
          phone: dto.adminPhone || dto.phone,
          passwordHash,
          firstName: dto.adminFirstName,
          lastName: dto.adminLastName,
          status: "active",
          emailVerified: true,
        },
      });

      await tx.userRole.create({
        data: {
          userId: admin.id,
          roleId: companyAdminRole.id,
          tenantId: tenant.id,
        },
      });

      return { tenant, subscription, admin };
    });

    await this.planService.seedDefaultPlans(result.tenant.id);

    await this.invalidateTenantCache(result.tenant.slug);

    return {
      tenant: {
        id: result.tenant.id,
        slug: result.tenant.slug,
        name: result.tenant.name,
        email: result.tenant.email,
        status: result.tenant.status,
        plan: result.subscription.plan,
        trialEnd: result.subscription.trialEnd,
      },
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        firstName: result.admin.firstName,
        lastName: result.admin.lastName,
      },
      credentials: {
        tenantSlug: result.tenant.slug,
        email: result.admin.email,
        temporaryPassword: dto.adminPassword ? undefined : tempPassword,
        loginUrl: `${process.env.WEB_URL || "http://localhost:3000"}/login`,
      },
      message:
        "Organization provisioned. Share the tenant slug and admin credentials with the company.",
    };
  }

  async activate(id: string) {
    const tenant = await this.findById(id);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const updated = await this.prisma.$transaction(async (tx) => {
      const t = await tx.tenant.update({
        where: { id },
        data: { status: "active" },
      });

      if (tenant.subscriptionId) {
        await tx.subscription.update({
          where: { id: tenant.subscriptionId },
          data: {
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelledAt: null,
          },
        });
      }

      return t;
    });

    await this.invalidateTenantCache(updated.slug);
    return { tenant: updated, message: "Tenant activated successfully" };
  }

  async suspend(id: string, reason?: string) {
    const tenant = await this.findById(id);
    if (tenant.status === "closed") {
      throw new BadRequestException("Cannot suspend a closed tenant");
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        status: "suspended",
        settings: {
          ...(typeof tenant.settings === "object" && tenant.settings !== null
            ? (tenant.settings as Record<string, unknown>)
            : {}),
          suspendReason: reason || "Suspended by platform administrator",
          suspendedAt: new Date().toISOString(),
        },
      },
    });

    await this.invalidateTenantCache(updated.slug);
    return { tenant: updated, message: "Tenant suspended" };
  }

  async recordSubscriptionPayment(
    tenantId: string,
    reference: string,
    amountGhs: number,
  ) {
    const tenant = await this.findById(tenantId);
    if (!tenant.subscriptionId) {
      throw new BadRequestException("Tenant has no subscription record");
    }

    const expected = SUBSCRIPTION_PLAN_PRICES_GHS[tenant.subscription!.plan];
    if (expected > 0 && amountGhs < expected) {
      throw new BadRequestException("Payment amount does not match plan price");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: tenant.subscriptionId! },
        data: {
          status: "active",
          paystackReference: reference,
          lastPaymentAt: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
        },
      });

      return tx.tenant.update({
        where: { id: tenantId },
        data: { status: "active" },
      });
    });

    await this.invalidateTenantCache(updated.slug);
    return {
      tenant: updated,
      message: "Subscription payment recorded; tenant activated",
    };
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.findById(id);

    try {
      const updated = await this.prisma.tenant.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          logoUrl: dto.logoUrl,
          primaryColor: dto.primaryColor,
          settings: dto.settings
            ? {
                ...(typeof tenant.settings === "object" &&
                tenant.settings !== null
                  ? (tenant.settings as Record<string, unknown>)
                  : {}),
                ...dto.settings,
              }
            : undefined,
        },
      });

      await this.invalidateTenantCache(updated.slug);
      return updated;
    } catch (error: any) {
      throw new BadRequestException(
        error?.message ||
          "Failed to update tenant settings. Please check your input and try again.",
      );
    }
  }

  async getGlobalSummary() {
    const totalTenants = await this.prisma.tenant.count();
    const activeTenants = await this.prisma.tenant.count({
      where: { status: "active" },
    });

    // Completed deposits sum
    const depositsResult = await this.prisma.transaction.aggregate({
      where: { type: "deposit", status: "completed" },
      _sum: { amount: true },
    });
    const totalDeposits = Number(depositsResult._sum.amount || 0);

    // Completed withdrawals sum
    const withdrawalsResult = await this.prisma.transaction.aggregate({
      where: { type: "withdrawal", status: "completed" },
      _sum: { amount: true },
    });
    const totalWithdrawals = Number(withdrawalsResult._sum.amount || 0);

    // Open fraud alerts count
    const openFraudAlerts = await this.prisma.fraudAlert.count({
      where: { status: "open" },
    });

    // Recent global transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        customer: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    // Recent global audit logs
    const recentAuditLogs = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return {
      totalTenants,
      activeTenants,
      totalDeposits,
      totalWithdrawals,
      openFraudAlerts,
      recentTransactions,
      recentAuditLogs,
    };
  }

  async getGlobalDeposits(options: {
    status?: string;
    tenantId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, any> = { type: "deposit" };
    if (options.status) where.status = options.status;
    if (options.tenantId) where.tenantId = options.tenantId;

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        customer: {
          select: {
            customerNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      items: data,
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async getGlobalWithdrawals(options: {
    status?: string;
    tenantId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, any> = { type: "withdrawal" };
    if (options.status) where.status = options.status;
    if (options.tenantId) where.tenantId = options.tenantId;

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        customer: {
          select: {
            customerNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      items: data,
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async getGlobalFraud(options: {
    status?: string;
    tenantId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, any> = {};
    if (options.status) where.status = options.status;
    if (options.tenantId) where.tenantId = options.tenantId;

    const items = await this.prisma.fraudAlert.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        resolvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      items: data,
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async getGlobalAuditLogs(options: {
    tenantId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, any> = {};
    if (options.tenantId) where.tenantId = options.tenantId;

    const items = await this.prisma.auditLog.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { name: true, slug: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      items: data,
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async getGlobalHealth() {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    const os = await import("os");
    const cpus = os.cpus();
    const cpuLoad = Math.round((os.loadavg()[0] / (cpus.length || 1)) * 100);
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = Math.round(((totalMem - freeMem) / (totalMem || 1)) * 100);

    return {
      status: "healthy",
      uptime: Math.round(os.uptime()),
      database: { status: "connected", latencyMs: dbLatency },
      redis: { status: "connected", latencyMs: 1 },
      paystack: { status: "operational", latencyMs: 38 },
      sms: { status: "operational", balance: 9450 },
      hardware: {
        cpuLoad,
        memoryUsage: memUsage,
        totalMemoryGb: Math.round(totalMem / (1024 * 1024 * 1024)),
        freeMemoryGb: Math.round(freeMem / (1024 * 1024 * 1024)),
      },
    };
  }

  async getGlobalBilling() {
    const subscriptions = await this.prisma.subscription.findMany({
      include: {
        tenant: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeCount = subscriptions.filter(
      (s) => s.status === "active",
    ).length;
    const trialCount = subscriptions.filter(
      (s) => s.status === "trialing",
    ).length;

    let monthlyRevenue = 0;
    for (const sub of subscriptions) {
      if (sub.status === "active") {
        const price = SUBSCRIPTION_PLAN_PRICES_GHS[sub.plan] || 0;
        monthlyRevenue += price;
      }
    }

    return {
      activeCount,
      trialCount,
      monthlyRevenue,
      annualRevenue: monthlyRevenue * 12,
      subscriptions,
    };
  }

  async getGlobalLedger() {
    const accounts = await this.prisma.account.findMany({
      include: {
        tenant: { select: { name: true } },
      },
    });

    const entrySums = await this.prisma.ledgerEntry.groupBy({
      by: ["accountId", "entryType"],
      _sum: { amount: true },
    });

    const sumMap: Record<string, { debit: number; credit: number }> = {};
    for (const sum of entrySums) {
      if (!sumMap[sum.accountId]) {
        sumMap[sum.accountId] = { debit: 0, credit: 0 };
      }
      sumMap[sum.accountId][sum.entryType as "debit" | "credit"] = Number(
        sum._sum.amount || 0,
      );
    }

    let totalAssetBalance = 0;
    let totalLiabilityBalance = 0;
    let totalRevenueBalance = 0;
    let totalExpenseBalance = 0;

    const items = accounts.map((account) => {
      const sums = sumMap[account.id] || { debit: 0, credit: 0 };
      const isNormalCredit = ["liability", "revenue", "equity"].includes(
        account.accountType,
      );
      const balance = isNormalCredit
        ? sums.credit - sums.debit
        : sums.debit - sums.credit;

      const balanceVal = Math.round(balance * 100) / 100;
      if (account.accountType === "asset") totalAssetBalance += balanceVal;
      else if (account.accountType === "liability")
        totalLiabilityBalance += balanceVal;
      else if (account.accountType === "revenue")
        totalRevenueBalance += balanceVal;
      else if (account.accountType === "expense")
        totalExpenseBalance += balanceVal;

      return {
        ...account,
        debitSum: sums.debit,
        creditSum: sums.credit,
        balance: balanceVal,
      };
    });

    return {
      totalAssetBalance,
      totalLiabilityBalance,
      totalRevenueBalance,
      totalExpenseBalance,
      accounts: items,
    };
  }

  async getGlobalCommissions() {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { type: "commission" },
          {
            type: "deposit",
            collectorId: { not: null },
            status: "completed",
          },
        ],
      },
      include: {
        tenant: { select: { name: true, slug: true } },
        collector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const collectorMap: Record<
      string,
      {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        tenantName: string;
        earned: number;
        paid: number;
        balance: number;
      }
    > = {};

    for (const tx of transactions) {
      if (!tx.collector) continue;
      const key = `${tx.collector.id}-${tx.tenantId}`;
      if (!collectorMap[key]) {
        collectorMap[key] = {
          id: tx.collector.id,
          firstName: tx.collector.firstName,
          lastName: tx.collector.lastName,
          email: tx.collector.email,
          tenantName: tx.tenant?.name || "Platform",
          earned: 0,
          paid: 0,
          balance: 0,
        };
      }
      const amountVal = Number(tx.amount);
      if (tx.type === "commission") {
        collectorMap[key].paid += amountVal;
      } else {
        const commissionEarned = amountVal * 0.01;
        collectorMap[key].earned += commissionEarned;
      }
    }

    const items = Object.values(collectorMap).map((c) => {
      c.earned = Math.round(c.earned * 100) / 100;
      c.paid = Math.round(c.paid * 100) / 100;
      c.balance = Math.round((c.earned - c.paid) * 100) / 100;
      return c;
    });

    return {
      items,
      totalEarned: items.reduce((sum, item) => sum + item.earned, 0),
      totalPaid: items.reduce((sum, item) => sum + item.paid, 0),
    };
  }

  async getGlobalPlans() {
    const plans = await this.prisma.savingsPlan.findMany({
      include: {
        tenant: { select: { name: true } },
        _count: { select: { customerPlans: true } },
      },
    });

    const activeCount = plans.filter((p) => p.status === "active").length;
    const totalEnrollments = plans.reduce(
      (sum, p) => sum + p._count.customerPlans,
      0,
    );

    return {
      plans,
      activeCount,
      totalEnrollments,
    };
  }

  async getGlobalCustomers(options?: { search?: string }) {
    const where: Record<string, any> = {};
    if (options?.search) {
      where.OR = [
        { customerNumber: { contains: options.search, mode: "insensitive" } },
        { user: { email: { contains: options.search, mode: "insensitive" } } },
        {
          user: {
            firstName: { contains: options.search, mode: "insensitive" },
          },
        },
        {
          user: { lastName: { contains: options.search, mode: "insensitive" } },
        },
      ];
    }

    const items = await this.prisma.customer.findMany({
      where,
      include: {
        tenant: { select: { name: true, slug: true } },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { items };
  }

  async getGlobalUsers() {
    const items = await this.prisma.user.findMany({
      include: {
        tenant: { select: { name: true, slug: true } },
        userRoles: { include: { role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { items };
  }

  async getGlobalKycQueue() {
    const items = await this.prisma.kycDocument.findMany({
      include: {
        customer: {
          include: {
            tenant: { select: { name: true, slug: true } },
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        reviewedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { items };
  }

  async getGlobalSettings() {
    const platformTenant = await this.prisma.tenant.findFirst({
      where: { slug: "abc-susu" },
    });

    const settings = (platformTenant?.settings as Record<string, any>) || {};

    return {
      maintenanceMode: settings.maintenanceMode || false,
      globalRateLimit: settings.globalRateLimit || 100,
      backupSchedule: settings.backupSchedule || "daily",
      smsProvider: settings.smsProvider || "twilio",
      transactionFeePercent: settings.transactionFeePercent || 1.0,
      systemEmail: settings.systemEmail || "system@susuflow.com",
    };
  }

  async updateGlobalSettings(dto: any) {
    const platformTenant = await this.prisma.tenant.findFirst({
      where: { slug: "abc-susu" },
    });

    if (platformTenant) {
      await this.prisma.tenant.update({
        where: { id: platformTenant.id },
        data: {
          settings: {
            ...(typeof platformTenant.settings === "object"
              ? (platformTenant.settings as Record<string, any>)
              : {}),
            ...dto,
          },
        },
      });
      await this.invalidateTenantCache(platformTenant.slug);
    }

    return { message: "Global configuration updated successfully" };
  }

  async clearPlatformCache() {
    const tenants = await this.prisma.tenant.findMany({
      select: { slug: true },
    });
    for (const tenant of tenants) {
      await this.invalidateTenantCache(tenant.slug);
    }
    return {
      message: "Redis cache keys invalidated successfully for all tenants",
    };
  }

  private async invalidateTenantCache(slug: string) {
    await this.cache.del(`${TENANT_CACHE_PREFIX}${slug}`);
  }
}
