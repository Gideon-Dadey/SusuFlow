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

const DEFAULT_SAVINGS_PLANS = [
  {
    name: "Daily Susu",
    description: "Save a small amount every day",
    frequency: "daily" as const,
    minAmount: 5,
    maxAmount: 100,
    durationMonths: 12,
  },
  {
    name: "Weekly Susu",
    description: "Commit to weekly savings",
    frequency: "weekly" as const,
    minAmount: 20,
    maxAmount: 500,
    durationMonths: 12,
  },
  {
    name: "Monthly Susu",
    description: "Monthly savings goal",
    frequency: "monthly" as const,
    minAmount: 50,
    maxAmount: 2000,
    durationMonths: 12,
  },
];

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaultPlans(tenantId: string) {
    for (const plan of DEFAULT_SAVINGS_PLANS) {
      const exists = await this.prisma.savingsPlan.findFirst({
        where: { tenantId, name: plan.name },
      });
      if (!exists) {
        await this.prisma.savingsPlan.create({
          data: { tenantId, ...plan, status: "active" },
        });
      }
    }
  }

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
      },
      include: { plan: true },
    });
  }

  async myEnrollments(tenantId: string, customerUserId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId: customerUserId },
    });
    if (!customer) {
      throw new NotFoundException("Customer profile not found");
    }

    const enrollments = await this.prisma.customerPlan.findMany({
      where: { customerId: customer.id, status: "active" },
      include: { plan: true },
    });

    const result = [];
    for (const enrollment of enrollments) {
      const depositsSum = await this.prisma.transaction.aggregate({
        where: {
          customerId: customer.id,
          type: "deposit",
          status: "completed",
          createdAt: { gte: enrollment.startedAt },
        },
        _sum: { amount: true },
      });

      const savedAmount = Number(depositsSum._sum.amount || 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      result.push({
        ...enrollment,
        savedAmount,
        progressPercent:
          targetVal > 0
            ? Math.min(100, Math.round((savedAmount / targetVal) * 100))
            : 0,
      });
    }

    return result;
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

    const result = [];
    for (const enrollment of enrollments) {
      const depositsSum = await this.prisma.transaction.aggregate({
        where: {
          customerId: enrollment.customerId,
          type: "deposit",
          status: "completed",
          createdAt: { gte: enrollment.startedAt },
        },
        _sum: { amount: true },
      });

      const savedAmount = Number(depositsSum._sum.amount || 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      result.push({
        ...enrollment,
        savedAmount,
        progressPercent:
          targetVal > 0
            ? Math.min(100, Math.round((savedAmount / targetVal) * 100))
            : 0,
      });
    }

    return result;
  }
}
