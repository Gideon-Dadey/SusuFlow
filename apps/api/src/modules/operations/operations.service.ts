import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ROLES } from "@susuflow/shared";
import { AuditService } from "../audit/audit.service";

export type QueueItemType =
  | "withdrawal"
  | "deposit"
  | "kyc"
  | "fraud"
  | "customer";

export interface QueueItem {
  id: string;
  type: QueueItemType;
  title: string;
  subtitle: string;
  amount?: number;
  status: string;
  createdAt: Date;
  priority: "high" | "medium" | "low";
}

@Injectable()
export class OperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getActionQueue(tenantId: string) {
    const [
      pendingWithdrawals,
      pendingDeposits,
      pendingKyc,
      openFraud,
      pendingCustomers,
    ] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { tenantId, status: "requested" },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.transaction.findMany({
        where: { tenantId, type: "deposit", status: "pending" },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.kycDocument.findMany({
        where: {
          status: "pending",
          customer: { tenantId },
        },
        include: {
          customer: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.fraudAlert.findMany({
        where: { tenantId, status: "open" },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.customer.findMany({
        where: { tenantId, status: "pending" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const items: QueueItem[] = [];

    for (const w of pendingWithdrawals) {
      const name = w.customer?.user
        ? `${w.customer.user.firstName} ${w.customer.user.lastName}`
        : "Customer";
      items.push({
        id: w.id,
        type: "withdrawal",
        title: `Withdrawal request — ${name}`,
        subtitle: w.customer?.customerNumber || "",
        amount: Number(w.amount),
        status: w.status,
        createdAt: w.createdAt,
        priority: "high",
      });
    }

    for (const d of pendingDeposits) {
      const name = d.customer?.user
        ? `${d.customer.user.firstName} ${d.customer.user.lastName}`
        : "Customer";
      items.push({
        id: d.id,
        type: "deposit",
        title: `Deposit verification — ${name}`,
        subtitle: d.reference,
        amount: Number(d.amount),
        status: d.status,
        createdAt: d.createdAt,
        priority: "medium",
      });
    }

    for (const doc of pendingKyc) {
      const name = doc.customer?.user
        ? `${doc.customer.user.firstName} ${doc.customer.user.lastName}`
        : "Customer";
      items.push({
        id: doc.id,
        type: "kyc",
        title: `KYC review — ${doc.documentType.replace(/_/g, " ")}`,
        subtitle: name,
        status: doc.status,
        createdAt: doc.createdAt,
        priority: "medium",
      });
    }

    for (const alert of openFraud) {
      items.push({
        id: alert.id,
        type: "fraud",
        title: `Fraud alert — ${alert.rule.replace(/_/g, " ")}`,
        subtitle: `${alert.severity} severity`,
        status: alert.status,
        createdAt: alert.createdAt,
        priority: alert.severity === "high" ? "high" : "medium",
      });
    }

    for (const c of pendingCustomers) {
      const name = c.user
        ? `${c.user.firstName} ${c.user.lastName}`
        : "New customer";
      items.push({
        id: c.id,
        type: "customer",
        title: `Account activation — ${name}`,
        subtitle: c.customerNumber,
        status: c.status,
        createdAt: c.createdAt,
        priority: "low",
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => {
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const summary = {
      pendingWithdrawals: pendingWithdrawals.length,
      pendingDeposits: pendingDeposits.length,
      pendingKyc: pendingKyc.length,
      openFraud: openFraud.length,
      pendingCustomers: pendingCustomers.length,
      total:
        pendingWithdrawals.length +
        pendingDeposits.length +
        pendingKyc.length +
        openFraud.length +
        pendingCustomers.length,
    };

    return { summary, items: items.slice(0, 50) };
  }

  async getCollectorPerformance(tenantId: string) {
    const collectors = await this.prisma.user.findMany({
      where: {
        tenantId,
        userRoles: {
          some: { role: { name: ROLES.COLLECTOR } },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { firstName: "asc" },
    });

    const collectorIds = collectors.map((c) => c.id);
    if (collectorIds.length === 0) {
      return { items: [] };
    }

    const [customerCounts, depositStats, commissionAccount] = await Promise.all(
      [
        this.prisma.customer.groupBy({
          by: ["collectorId"],
          where: { tenantId, collectorId: { in: collectorIds } },
          _count: { id: true },
        }),
        this.prisma.transaction.groupBy({
          by: ["collectorId"],
          where: {
            tenantId,
            collectorId: { in: collectorIds },
            type: "deposit",
            status: "completed",
          },
          _count: { id: true },
          _sum: { amount: true },
        }),
        this.prisma.account.findFirst({
          where: { tenantId, code: "1200" },
        }),
      ],
    );

    const customerMap = Object.fromEntries(
      customerCounts.map((r) => [r.collectorId, r._count.id]),
    );
    const depositMap = Object.fromEntries(
      depositStats.map((r) => [
        r.collectorId,
        { count: r._count.id, volume: Number(r._sum.amount || 0) },
      ]),
    );

    let commissionByCollector: Record<
      string,
      { earned: number; paid: number }
    > = {};
    if (commissionAccount) {
      const commissionTxns = await this.prisma.transaction.findMany({
        where: {
          tenantId,
          collectorId: { in: collectorIds },
          type: { in: ["deposit", "commission"] },
          status: "completed",
        },
        include: {
          ledgerEntries: {
            where: { accountId: commissionAccount.id },
            select: { entryType: true, amount: true },
          },
        },
      });

      for (const tx of commissionTxns) {
        if (!tx.collectorId) continue;
        if (!commissionByCollector[tx.collectorId]) {
          commissionByCollector[tx.collectorId] = { earned: 0, paid: 0 };
        }
        const entry = tx.ledgerEntries[0];
        if (!entry) continue;
        const amt = Number(entry.amount);
        if (tx.type === "deposit" && entry.entryType === "credit") {
          commissionByCollector[tx.collectorId].earned += amt;
        } else if (tx.type === "commission" && entry.entryType === "debit") {
          commissionByCollector[tx.collectorId].paid += amt;
        }
      }
    }

    const items = collectors.map((collector) => {
      const customers = customerMap[collector.id] || 0;
      const deposits = depositMap[collector.id] || { count: 0, volume: 0 };
      const commission = commissionByCollector[collector.id] || {
        earned: 0,
        paid: 0,
      };

      return {
        ...collector,
        customerCount: customers,
        depositsCount: deposits.count,
        depositsVolume: deposits.volume,
        commissionEarned: commission.earned,
        commissionPaid: commission.paid,
        commissionBalance: commission.earned - commission.paid,
      };
    });

    items.sort((a, b) => b.depositsVolume - a.depositsVolume);

    return { items };
  }

  async getMyCollectorSummary(tenantId: string, userId: string) {
    const collector = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });
    if (!collector) {
      throw new NotFoundException("Collector not found");
    }

    const [customerCount, depositStats, commissionAccount] = await Promise.all([
      this.prisma.customer.count({
        where: { tenantId, collectorId: userId },
      }),
      this.prisma.transaction.aggregate({
        where: {
          tenantId,
          collectorId: userId,
          type: "deposit",
          status: "completed",
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.account.findFirst({
        where: { tenantId, code: "1200" },
      }),
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayStats = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        collectorId: userId,
        type: "deposit",
        status: "completed",
        createdAt: { gte: todayStart },
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    let commissionEarned = 0;
    let commissionPaid = 0;

    if (commissionAccount) {
      const commissionTxns = await this.prisma.transaction.findMany({
        where: {
          tenantId,
          collectorId: userId,
          type: { in: ["deposit", "commission"] },
          status: "completed",
        },
        include: {
          ledgerEntries: {
            where: { accountId: commissionAccount.id },
            select: { entryType: true, amount: true },
          },
        },
      });

      for (const tx of commissionTxns) {
        const entry = tx.ledgerEntries[0];
        if (!entry) continue;
        const amt = Number(entry.amount);
        if (tx.type === "deposit" && entry.entryType === "credit") {
          commissionEarned += amt;
        } else if (tx.type === "commission" && entry.entryType === "debit") {
          commissionPaid += amt;
        }
      }
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekStats = await this.prisma.transaction.aggregate({
      where: {
        tenantId,
        collectorId: userId,
        type: "deposit",
        status: "completed",
        createdAt: { gte: weekStart },
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    const pendingDeposits = await this.prisma.transaction.count({
      where: {
        tenantId,
        collectorId: userId,
        type: "deposit",
        status: "pending",
      },
    });

    return {
      collector,
      customerCount,
      depositsCount: depositStats._count.id,
      depositsVolume: Number(depositStats._sum.amount || 0),
      todayDepositsCount: todayStats._count.id,
      todayDepositsVolume: Number(todayStats._sum.amount || 0),
      weekDepositsCount: weekStats._count.id,
      weekDepositsVolume: Number(weekStats._sum.amount || 0),
      commissionEarned,
      commissionPaid,
      commissionBalance: commissionEarned - commissionPaid,
      pendingDeposits,
    };
  }

  async getMyActivity(tenantId: string, userId: string, limit = 50) {
    return this.audit.findAll(tenantId, { userId, limit });
  }
}
