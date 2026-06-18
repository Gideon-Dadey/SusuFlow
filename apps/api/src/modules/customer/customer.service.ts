import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/customer.dto';
import { AuthenticatedUser } from '@susuflow/shared';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto, onboardedBy: AuthenticatedUser) {
    const count = await this.prisma.customer.count({ where: { tenantId } });

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          tenantId,
          customerNumber: `CUS-${String(count + 1).padStart(6, '0')}`,
          ghanaCardNumber: dto.ghanaCardNumber,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          address: dto.address,
          collectorId: dto.collectorId || (onboardedBy.roles.includes('collector') ? onboardedBy.id : undefined),
          onboardedById: onboardedBy.id,
          status: 'pending',
        },
      });

      const wallet = await tx.wallet.create({
        data: { tenantId, customerId: customer.id, walletType: 'customer' },
      });

      await tx.account.create({
        data: {
          tenantId,
          walletId: wallet.id,
          code: `1100-${customer.id.slice(0, 8)}`,
          name: `Wallet: ${dto.firstName || 'Customer'} ${dto.lastName || customer.customerNumber}`,
          accountType: 'liability',
        },
      });

      return customer;
    });
  }

  async findAll(tenantId: string, options: {
    search?: string;
    status?: string;
    collectorId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = options.limit || 20;
    const where: Record<string, unknown> = { tenantId };

    if (options.status) where.status = options.status;
    if (options.collectorId) where.collectorId = options.collectorId;
    if (options.search) {
      where.OR = [
        { customerNumber: { contains: options.search, mode: 'insensitive' } },
        { user: { firstName: { contains: options.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        wallets: { select: { id: true, status: true, walletType: true, currency: true } },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const hasMore = customers.length > limit;
    const items = hasMore ? customers.slice(0, -1) : customers;

    return { items, cursor: hasMore ? items[items.length - 1]?.id : undefined, hasMore };
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        wallets: { include: { accounts: true } },
        collector: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
