import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EnrollPlanDto } from './dto/plan.dto';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(tenantId: string) {
    return this.prisma.savingsPlan.findMany({
      where: { tenantId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async enroll(tenantId: string, customerUserId: string, dto: EnrollPlanDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId: customerUserId },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const plan = await this.prisma.savingsPlan.findFirst({
      where: { id: dto.planId, tenantId, status: 'active' },
    });
    if (!plan) {
      throw new NotFoundException('Savings plan not found or inactive');
    }

    // Check if already enrolled in this plan actively
    const existing = await this.prisma.customerPlan.findFirst({
      where: {
        customerId: customer.id,
        planId: plan.id,
        status: 'active',
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
        status: 'active',
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
      throw new NotFoundException('Customer profile not found');
    }

    const enrollments = await this.prisma.customerPlan.findMany({
      where: { customerId: customer.id, status: 'active' },
      include: { plan: true },
    });

    const result = [];
    for (const enrollment of enrollments) {
      const depositsSum = await this.prisma.transaction.aggregate({
        where: {
          customerId: customer.id,
          type: 'deposit',
          status: 'completed',
          createdAt: { gte: enrollment.startedAt },
        },
        _sum: { amount: true },
      });

      const savedAmount = Number(depositsSum._sum.amount || 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      result.push({
        ...enrollment,
        savedAmount,
        progressPercent: targetVal > 0
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
        startedAt: 'desc',
      },
    });

    const result = [];
    for (const enrollment of enrollments) {
      const depositsSum = await this.prisma.transaction.aggregate({
        where: {
          customerId: enrollment.customerId,
          type: 'deposit',
          status: 'completed',
          createdAt: { gte: enrollment.startedAt },
        },
        _sum: { amount: true },
      });

      const savedAmount = Number(depositsSum._sum.amount || 0);
      const targetVal = Number(enrollment.targetAmount || 0);

      result.push({
        ...enrollment,
        savedAmount,
        progressPercent: targetVal > 0
          ? Math.min(100, Math.round((savedAmount / targetVal) * 100))
          : 0,
      });
    }

    return result;
  }
}

