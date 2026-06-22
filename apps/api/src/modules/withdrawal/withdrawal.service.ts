import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { CreateWithdrawalDto } from './dto/withdrawal.dto';
import { generateTransactionReference, AuthenticatedUser } from '@susuflow/shared';
import { PaymentMethod } from '@susuflow/database';

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {}

  async create(tenantId: string, dto: CreateWithdrawalDto, initiatedBy: AuthenticatedUser) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
      include: { wallets: { where: { walletType: 'customer' } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const wallet = customer.wallets[0];
    if (!wallet) throw new NotFoundException('Customer wallet not found');

    // Get current balance
    const balance = await this.ledger.getWalletBalance(wallet.id);
    if (balance < dto.amount) {
      throw new BadRequestException(`Insufficient funds. Current balance: GHS ${balance.toFixed(2)}`);
    }

    const reference = generateTransactionReference();

    // Create database records and update balance
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference,
          type: 'withdrawal',
          status: 'completed', // completed immediately as it is recorded by staff
          amount: dto.amount,
          customerId: customer.id,
          walletId: wallet.id,
          initiatedById: initiatedBy.id,
          description: `Withdrawal to ${dto.disbursementPhone} (${dto.disbursementMethod})`,
          completedAt: new Date(),
        },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          customerId: customer.id,
          amount: dto.amount,
          status: 'completed',
          disbursementMethod: dto.disbursementMethod as PaymentMethod,
          disbursementPhone: dto.disbursementPhone,
          approvedById: initiatedBy.id,
          approvedAt: new Date(),
          gatewayReference: `MOCK-WD-${reference}`,
        },
      });

      return { transaction, withdrawal };
    });

    // Post double-entry ledger entries
    const platformCash = await this.ledger.getAccountByCode(tenantId, '1000');
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId: wallet.id },
    });

    if (!customerAccount) throw new Error('Customer ledger account not found');

    // Debit: Customer Wallet Account (liability decreases)
    // Credit: Platform Cash Account (asset decreases)
    await this.ledger.postEntries(tenantId, result.transaction.id, [
      { accountId: customerAccount.id, entryType: 'debit', amount: dto.amount, description: `Withdrawal ${reference}` },
      { accountId: platformCash.id, entryType: 'credit', amount: dto.amount, description: `Withdrawal ${reference}` },
    ]);

    return this.prisma.transaction.findUnique({
      where: { id: result.transaction.id },
      include: { withdrawal: true },
    });
  }

  async findAll(tenantId: string, options: { customerId?: string; cursor?: string; limit?: number }) {
    const limit = options.limit || 20;
    const where: Record<string, unknown> = { tenantId, type: 'withdrawal' };
    if (options.customerId) where.customerId = options.customerId;

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        withdrawal: true,
        customer: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    return { items: data, cursor: hasMore ? data[data.length - 1]?.id : undefined, hasMore };
  }
}
