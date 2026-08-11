import { Injectable } from "@nestjs/common";
import { Prisma } from "@susuflow/database";
import { PrismaService } from "../../prisma/prisma.service";
import { clampPageLimit } from "@susuflow/shared";

const ROLE_LABELS: Record<string, string> = {
  company_admin: "Admin",
  account_officer: "Officer",
  collector: "Collector",
  auditor: "Auditor",
  customer: "Customer",
  super_admin: "Super admin",
};

type AuditCategory = "money" | "customers" | "identity" | "access" | "risk";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function fullName(
  person?: { firstName?: string | null; lastName?: string | null } | null,
) {
  if (!person) return "";
  return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();
}

function pickString(record: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(record: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return undefined;
}

function categoryWhere(
  category?: string,
): Prisma.AuditLogWhereInput | undefined {
  switch (category) {
    case "money":
      return {
        OR: [
          { action: { startsWith: "deposit" } },
          { action: { startsWith: "withdrawal" } },
          { action: { startsWith: "ledger" } },
          { resourceType: { in: ["transaction"] } },
        ],
      };
    case "customers":
      return { action: { startsWith: "customer" } };
    case "identity":
      return { action: { startsWith: "kyc" } };
    case "access":
      return { action: { startsWith: "user" } };
    case "risk":
      return { action: { startsWith: "fraud" } };
    default:
      return undefined;
  }
}

function classifyAction(action: string): AuditCategory {
  if (
    action.startsWith("deposit") ||
    action.startsWith("withdrawal") ||
    action.startsWith("ledger")
  ) {
    return "money";
  }
  if (action.startsWith("kyc")) return "identity";
  if (action.startsWith("fraud")) return "risk";
  if (action.startsWith("user")) return "access";
  return "customers";
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    beforeState?: unknown;
    afterState?: unknown;
    correlationId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceId: data.deviceId,
        beforeState: data.beforeState as object,
        afterState: data.afterState as object,
        correlationId: data.correlationId,
      },
    });
  }

  async findAll(
    tenantId: string,
    options: {
      userId?: string;
      action?: string;
      resourceType?: string;
      category?: string;
      q?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    const limit = clampPageLimit(options.limit);
    const query = options.q?.trim();
    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      ...(options.userId ? { userId: options.userId } : {}),
      ...(options.action ? { action: options.action } : {}),
      ...(options.resourceType ? { resourceType: options.resourceType } : {}),
      ...categoryWhere(options.category),
      ...(query
        ? {
            OR: [
              { action: { contains: query, mode: "insensitive" } },
              { resourceType: { contains: query, mode: "insensitive" } },
              {
                user: {
                  firstName: { contains: query, mode: "insensitive" },
                },
              },
              {
                user: { lastName: { contains: query, mode: "insensitive" } },
              },
              { user: { email: { contains: query, mode: "insensitive" } } },
              {
                afterState: {
                  path: ["customerName"],
                  string_contains: query,
                },
              },
              {
                afterState: {
                  path: ["reference"],
                  string_contains: query,
                },
              },
            ],
          }
        : {}),
    };

    const [items, grouped] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: limit + 1,
        ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userRoles: {
                select: { role: { select: { name: true } } },
              },
            },
          },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ["action"],
        where: { tenantId },
        _count: { _all: true },
      }),
    ]);

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    return {
      items: await this.present(tenantId, data),
      cursor: hasMore ? data[data.length - 1]?.id : undefined,
      hasMore,
      summary: this.summarize(grouped),
    };
  }

  private summarize(
    grouped: Array<{ action: string; _count: { _all: number } }>,
  ) {
    const summary = {
      all: 0,
      money: 0,
      customers: 0,
      identity: 0,
      access: 0,
      risk: 0,
    };

    for (const row of grouped) {
      summary.all += row._count._all;
      summary[classifyAction(row.action)] += row._count._all;
    }

    return summary;
  }

  private async present(
    tenantId: string,
    items: Array<{
      id: string;
      action: string;
      resourceType: string;
      resourceId: string | null;
      ipAddress: string | null;
      userAgent: string | null;
      deviceId: string | null;
      beforeState: unknown;
      afterState: unknown;
      correlationId: string | null;
      createdAt: Date;
      userId: string | null;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        userRoles: Array<{ role: { name: string } }>;
      } | null;
    }>,
  ) {
    const customerIds = new Set<string>();
    const transactionIds = new Set<string>();

    for (const item of items) {
      const after = asRecord(item.afterState);
      if (item.resourceId) customerIds.add(item.resourceId);
      const customerId = pickString(after, "customerId");
      if (customerId) customerIds.add(customerId);
      if (item.resourceType === "transaction" && item.resourceId) {
        transactionIds.add(item.resourceId);
      }
    }

    const [customers, transactions] = await Promise.all([
      customerIds.size
        ? this.prisma.customer.findMany({
            where: { tenantId, id: { in: [...customerIds] } },
            select: {
              id: true,
              customerNumber: true,
              user: { select: { firstName: true, lastName: true } },
            },
          })
        : [],
      transactionIds.size
        ? this.prisma.transaction.findMany({
            where: { tenantId, id: { in: [...transactionIds] } },
            select: {
              id: true,
              reference: true,
              amount: true,
              type: true,
              status: true,
              customerId: true,
              customer: {
                select: {
                  id: true,
                  customerNumber: true,
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
          })
        : [],
    ]);

    const customerById = new Map(customers.map((row) => [row.id, row]));
    const transactionById = new Map(transactions.map((row) => [row.id, row]));

    return items.map((item) => {
      const after = asRecord(item.afterState);
      const transaction = item.resourceId
        ? transactionById.get(item.resourceId)
        : undefined;
      const subjectCustomerId =
        pickString(after, "customerId") ||
        transaction?.customerId ||
        (item.resourceType === "customer" ? item.resourceId : undefined);
      const customer = subjectCustomerId
        ? customerById.get(subjectCustomerId)
        : transaction?.customer;

      const role =
        item.user?.userRoles.find((entry) => entry.role.name !== "customer")
          ?.role.name ||
        item.user?.userRoles[0]?.role.name ||
        undefined;

      const storedSubject = pickString(
        after,
        "customerName",
        "subjectName",
        "memberName",
      );
      const subjectName =
        storedSubject || fullName(customer?.user) || undefined;

      const amount =
        pickNumber(after, "amount") ??
        (transaction ? Number(transaction.amount) : undefined);
      const reference =
        pickString(after, "reference") || transaction?.reference || undefined;

      return {
        id: item.id,
        action: item.action,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        deviceId: item.deviceId,
        beforeState: item.beforeState,
        afterState: item.afterState,
        correlationId: item.correlationId,
        createdAt: item.createdAt,
        category: classifyAction(item.action),
        user: item.user
          ? {
              id: item.user.id,
              firstName: item.user.firstName,
              lastName: item.user.lastName,
              email: item.user.email,
            }
          : null,
        actor: item.user
          ? {
              id: item.user.id,
              name: fullName(item.user) || item.user.email,
              email: item.user.email,
              role,
              roleLabel: role ? ROLE_LABELS[role] || role : "Staff",
            }
          : null,
        subject: subjectName
          ? {
              id: subjectCustomerId || item.resourceId,
              name: subjectName,
              secondary:
                pickString(after, "customerNumber") ||
                customer?.customerNumber ||
                undefined,
            }
          : null,
        money:
          amount != null
            ? {
                amount,
                reference,
                currency: "GHS",
              }
            : reference
              ? { amount: null, reference, currency: "GHS" }
              : null,
      };
    });
  }
}
