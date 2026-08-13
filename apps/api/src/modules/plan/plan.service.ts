import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  EnrollPlanDto,
  CreateSavingsPlanDto,
  UpdateSavingsPlanDto,
} from "./dto/plan.dto";

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSavingsPlanDto) {
    if (dto.maxAmount !== undefined && dto.maxAmount < dto.minAmount) {
      throw new BadRequestException(
        "maxAmount must be greater than or equal to minAmount",
      );
    }

    return this.prisma.savingsPlan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        frequency: dto.frequency,
        minAmount: dto.minAmount,
        maxAmount: dto.maxAmount,
        durationMonths: dto.durationMonths,
        status: "active",
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSavingsPlanDto) {
    const plan = await this.prisma.savingsPlan.findFirst({
      where: { id, tenantId },
    });
    if (!plan) throw new NotFoundException("Savings plan not found");

    const minAmount = dto.minAmount ?? Number(plan.minAmount);
    const maxAmount =
      dto.maxAmount ?? (plan.maxAmount ? Number(plan.maxAmount) : undefined);
    if (maxAmount !== undefined && maxAmount < minAmount) {
      throw new BadRequestException(
        "maxAmount must be greater than or equal to minAmount",
      );
    }

    return this.prisma.savingsPlan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.minAmount !== undefined ? { minAmount: dto.minAmount } : {}),
        ...(dto.maxAmount !== undefined ? { maxAmount: dto.maxAmount } : {}),
        ...(dto.durationMonths !== undefined
          ? { durationMonths: dto.durationMonths }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.savingsPlan.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllActive(tenantId: string) {
    return this.prisma.savingsPlan.findMany({
      where: { tenantId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
  }

  async enroll(tenantId: string, customerUserId: string, dto: EnrollPlanDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId: customerUserId },
    });
    if (!customer) {
      throw new NotFoundException("Customer profile not found");
    }

    const plan = await this.prisma.savingsPlan.findFirst({
      where: { id: dto.planId, tenantId, status: "active" },
    });
    if (!plan) {
      throw new NotFoundException("Savings plan not found or inactive");
    }

    // Check if already enrolled in this plan actively
    const existing = await this.prisma.customerPlan.findFirst({
      where: {
        customerId: customer.id,
        planId: plan.id,
        status: "active",
      },
    });
    if (existing) {
      return this.prisma.customerPlan.findUnique({
        where: { id: existing.id },
        include: { plan: true },
      });
    }

    return this.prisma.customerPlan.create({
      data: {
        customerId: customer.id,
        planId: plan.id,
        targetAmount: dto.targetAmount || plan.minAmount,
        status: "active",
        startedAt: new Date(),
        endsAt: plan.durationMonths
          ? new Date(
              Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000,
            )
          : null,
      },
      include: { plan: true },
    });
  }

  async myEnrollments(tenantId: string, customerUserId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId: customerUserId },
      select: { id: true },
    });
    if (!customer) {
      throw new NotFoundException("Customer profile not found");
    }

    const enrollments = await this.prisma.customerPlan.findMany({
      where: { customerId: customer.id, status: "active" },
      include: { plan: true },
    });

    if (enrollments.length === 0) {
      return [];
    }

    // One deposits query from the earliest enrollment start, then sum in memory.
    // Avoids N sequential aggregates that made Goals feel slow on cold load.
    const earliestStart = enrollments.reduce(
      (min, enrollment) =>
        enrollment.startedAt < min ? enrollment.startedAt : min,
      enrollments[0].startedAt,
    );

    const deposits = await this.prisma.transaction.findMany({
      where: {
        customerId: customer.id,
        type: "deposit",
        status: "completed",
        createdAt: { gte: earliestStart },
      },
      select: { amount: true, createdAt: true },
    });

    return enrollments.map((enrollment) => {
      const savedAmount = deposits.reduce((sum, deposit) => {
        if (deposit.createdAt >= enrollment.startedAt) {
          return sum + Number(deposit.amount);
        }
        return sum;
      }, 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      return {
        ...enrollment,
        savedAmount,
        progressPercent:
          targetVal > 0
            ? Math.min(100, Math.round((savedAmount / targetVal) * 100))
            : 0,
      };
    });
  }

  async allEnrollments(tenantId: string) {
    const enrollments = await this.prisma.customerPlan.findMany({
      where: {
        customer: {
          tenantId,
        },
      },
      include: {
        plan: true,
        customer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (enrollments.length === 0) {
      return [];
    }

    // Group by customer → one deposit fetch per customer, then map progress.
    const byCustomer = new Map<string, { earliestStart: Date }>();

    for (const enrollment of enrollments) {
      const existing = byCustomer.get(enrollment.customerId);
      if (!existing) {
        byCustomer.set(enrollment.customerId, {
          earliestStart: enrollment.startedAt,
        });
        continue;
      }
      if (enrollment.startedAt < existing.earliestStart) {
        existing.earliestStart = enrollment.startedAt;
      }
    }

    const depositsByCustomer = new Map<
      string,
      Array<{ amount: unknown; createdAt: Date }>
    >();

    await Promise.all(
      [...byCustomer.entries()].map(async ([customerId, meta]) => {
        const deposits = await this.prisma.transaction.findMany({
          where: {
            customerId,
            type: "deposit",
            status: "completed",
            createdAt: { gte: meta.earliestStart },
          },
          select: { amount: true, createdAt: true },
        });
        depositsByCustomer.set(customerId, deposits);
      }),
    );

    return enrollments.map((enrollment) => {
      const deposits = depositsByCustomer.get(enrollment.customerId) ?? [];
      const savedAmount = deposits.reduce((sum, deposit) => {
        if (deposit.createdAt >= enrollment.startedAt) {
          return sum + Number(deposit.amount);
        }
        return sum;
      }, 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      return {
        ...enrollment,
        savedAmount,
        progressPercent:
          targetVal > 0
            ? Math.min(100, Math.round((savedAmount / targetVal) * 100))
            : 0,
      };
    });
  }
}
