import { Injectable, ConflictException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { CreateDepositDto } from './dto/deposit.dto';
import { generateTransactionReference, MIN_DEPOSIT_AMOUNT, MAX_DEPOSIT_AMOUNT, DEPOSIT_EXPIRY_MINUTES, AuthenticatedUser } from '@susuflow/shared';
import { PAYMENT_GATEWAY, PaymentGateway } from '../payment/gateways/payment-gateway.interface';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DepositService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly config: ConfigService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    @InjectQueue('receipts') private readonly receiptQueue: Queue,
  ) {}

  async initiate(
    tenantId: string,
    dto: CreateDepositDto,
    initiatedBy: AuthenticatedUser,
  ) {
    if (dto.amount < MIN_DEPOSIT_AMOUNT || dto.amount > MAX_DEPOSIT_AMOUNT) {
      throw new BadRequestException(`Amount must be between ${MIN_DEPOSIT_AMOUNT} and ${MAX_DEPOSIT_AMOUNT}`);
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) throw new ConflictException('Duplicate deposit request');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
      include: { wallets: { where: { walletType: 'customer' } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const wallet = customer.wallets[0];
    if (!wallet) throw new NotFoundException('Customer wallet not found');

    const reference = generateTransactionReference();
    const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRY_MINUTES * 60 * 1000);

    const isCollectorAssisted = initiatedBy.roles.includes('collector');

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference,
          type: 'deposit',
          status: 'pending',
          amount: dto.amount,
          customerId: customer.id,
          walletId: wallet.id,
          initiatedById: initiatedBy.id,
          collectorId: isCollectorAssisted ? initiatedBy.id : dto.collectorId,
          idempotencyKey: dto.idempotencyKey,
          description: `Deposit via ${dto.paymentMethod}`,
        },
      });

      const payment = await tx.payment.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          gateway: 'hubtel',
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          status: 'initiated',
          payerPhone: dto.payerPhone,
          expiresAt,
        },
      });

      return { transaction, payment };
    });

    const session = await this.gateway.initiatePayment({
      amount: dto.amount,
      currency: 'GHS',
      reference,
      payerPhone: dto.payerPhone,
      paymentMethod: dto.paymentMethod,
      callbackUrl: `${this.config.get('API_URL')}/api/v1/webhooks/hubtel`,
      description: `SusuFlow deposit ${reference}`,
    });

    await this.prisma.payment.update({
      where: { id: result.payment.id },
      data: {
        gatewayReference: session.gatewayReference,
        status: 'pending',
      },
    });

    return {
      transactionId: result.transaction.id,
      reference,
      status: 'pending',
      payment: {
        id: result.payment.id,
        gateway: 'hubtel',
        paymentUrl: session.paymentUrl,
        expiresAt: session.expiresAt,
      },
    };
  }

  async confirmPayment(reference: string, gatewayReference: string, amount: number, payerPhone?: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: { payment: true, wallet: true },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status === 'completed') return transaction;

    const tenantId = transaction.tenantId;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: transaction.payment!.id },
        data: {
          status: 'success',
          gatewayReference,
          payerPhone,
          webhookReceivedAt: new Date(),
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed', completedAt: new Date() },
      });
    });

    const platformCash = await this.ledger.getAccountByCode(tenantId, '1000');
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId: transaction.walletId! },
    });

    if (!customerAccount) throw new Error('Customer ledger account not found');

    await this.ledger.postEntries(tenantId, transaction.id, [
      { accountId: platformCash.id, entryType: 'debit', amount, description: `Deposit ${reference}` },
      { accountId: customerAccount.id, entryType: 'credit', amount, description: `Deposit ${reference}` },
    ]);

    if (transaction.collectorId) {
      const settings = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      const commissionRate = (settings?.settings as Record<string, number>)?.commission_rate || 0.01;
      const commission = Math.round(amount * commissionRate * 100) / 100;

      if (commission > 0) {
        const commissionExpense = await this.ledger.getAccountByCode(tenantId, '5000');
        const commissionPayable = await this.ledger.getAccountByCode(tenantId, '1200');

        await this.ledger.postEntries(tenantId, transaction.id, [
          { accountId: commissionExpense.id, entryType: 'debit', amount: commission, description: 'Collector commission' },
          { accountId: commissionPayable.id, entryType: 'credit', amount: commission, description: 'Collector commission' },
        ]);
      }
    }

    await this.notificationQueue.add('deposit-confirmed', {
      tenantId,
      transactionId: transaction.id,
      reference,
      amount,
    });

    await this.receiptQueue.add('generate-receipt', {
      tenantId,
      transactionId: transaction.id,
      reference,
      amount,
    });

    return this.prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { payment: true },
    });
  }

  async findAll(tenantId: string, options: { status?: string; customerId?: string; cursor?: string; limit?: number }) {
    const limit = options.limit || 20;
    const where: Record<string, unknown> = { tenantId, type: 'deposit' };
    if (options.status) where.status = options.status;
    if (options.customerId) where.customerId = options.customerId;

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { payment: true, customer: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    return { items: data, cursor: hasMore ? data[data.length - 1]?.id : undefined, hasMore };
  }

  async findOne(tenantId: string, id: string) {
    const txn = await this.prisma.transaction.findFirst({
      where: { id, tenantId, type: 'deposit' },
      include: { payment: true, ledgerEntries: { include: { account: true } } },
    });
    if (!txn) throw new NotFoundException('Deposit not found');
    return txn;
  }

  async verifyReceipt(reference: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: {
        payment: true,
        withdrawal: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found or invalid reference');
    }

    // Set tenant context to this transaction's tenant so any RLS checks in this execution thread pass.
    await this.prisma.setTenantContext(transaction.tenantId);

    return transaction;
  }
}

