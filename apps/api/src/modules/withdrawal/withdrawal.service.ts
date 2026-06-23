import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { LedgerService } from "../ledger/ledger.service";
import {
  CreateWithdrawalDto,
  CreateWithdrawalRequestDto,
} from "./dto/withdrawal.dto";
import {
  generateTransactionReference,
  AuthenticatedUser,
  ROLES,
  clampPageLimit,
} from "@susuflow/shared";
import { PaymentMethod } from "@susuflow/database";
import { FinancialEventService } from "../../common/services/financial-event.service";

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
    private readonly financialEvents: FinancialEventService,
  ) {}

  async create(
    tenantId: string,
    dto: CreateWithdrawalDto,
    initiatedBy: AuthenticatedUser,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
      include: { wallets: { where: { walletType: "customer" } } },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    const wallet = customer.wallets[0];
    if (!wallet) throw new NotFoundException("Customer wallet not found");

    // Get current balance
    const balance = await this.ledger.getWalletBalance(wallet.id);
    if (balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient funds. Current balance: GHS ${balance.toFixed(2)}`,
      );
    }

    const reference = generateTransactionReference();

    // Create database records and update balance
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference,
          type: "withdrawal",
          status: "completed", // completed immediately as it is recorded by staff
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
          status: "completed",
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
    const platformCash = await this.ledger.getAccountByCode(tenantId, "1000");
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId: wallet.id },
    });

    if (!customerAccount) throw new Error("Customer ledger account not found");

    // Debit: Customer Wallet Account (liability decreases)
    // Credit: Platform Cash Account (asset decreases)
    await this.ledger.postEntries(tenantId, result.transaction.id, [
      {
        accountId: customerAccount.id,
        entryType: "debit",
        amount: dto.amount,
        description: `Withdrawal ${reference}`,
      },
      {
        accountId: platformCash.id,
        entryType: "credit",
        amount: dto.amount,
        description: `Withdrawal ${reference}`,
      },
    ]);

    await this.notificationQueue.add("withdrawal-completed", {
      tenantId,
      transactionId: result.transaction.id,
      reference,
      amount: dto.amount,
    });

    this.financialEvents.log({
      event: "withdrawal.completed",
      tenantId,
      transactionId: result.transaction.id,
      reference,
      amount: dto.amount,
      customerId: customer.id,
      userId: initiatedBy.id,
      status: "completed",
    });

    return this.prisma.transaction.findUnique({
      where: { id: result.transaction.id },
      include: { withdrawal: true },
    });
  }

  async findAll(
    tenantId: string,
    options: { customerId?: string; cursor?: string; limit?: number },
    user?: AuthenticatedUser,
  ) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, unknown> = { tenantId, type: "withdrawal" };

    if (user?.roles.includes(ROLES.CUSTOMER)) {
      const customer = await this.prisma.customer.findFirst({
        where: { userId: user.id, tenantId },
      });
      if (!customer) throw new NotFoundException("Customer profile not found");
      where.customerId = customer.id;
    } else if (options.customerId) {
      where.customerId = options.customerId;
    }

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        withdrawal: true,
        customer: {
          include: { user: { select: { firstName: true, lastName: true } } },
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

  async request(
    tenantId: string,
    dto: CreateWithdrawalRequestDto,
    initiatedBy: AuthenticatedUser,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { userId: initiatedBy.id, tenantId },
      include: { wallets: { where: { walletType: "customer" } } },
    });
    if (!customer) throw new NotFoundException("Customer profile not found");

    const wallet = customer.wallets[0];
    if (!wallet) throw new NotFoundException("Customer wallet not found");

    if (dto.amount < 10) {
      throw new BadRequestException("Minimum withdrawal amount is GHS 10.00");
    }

    // Get wallet balance
    const walletBalance = await this.ledger.getWalletBalance(wallet.id);

    // Sum of pending withdrawal requests
    const pendingWithdrawalsSum = await this.prisma.withdrawal.aggregate({
      where: {
        customerId: customer.id,
        status: { in: ["requested", "approved", "processing"] },
      },
      _sum: { amount: true },
    });
    const pendingAmount = Number(pendingWithdrawalsSum._sum.amount || 0);
    const availableBalance = walletBalance - pendingAmount;

    if (availableBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient funds. Current balance: GHS ${walletBalance.toFixed(2)}, pending withdrawals: GHS ${pendingAmount.toFixed(2)}, available: GHS ${availableBalance.toFixed(2)}`,
      );
    }

    const reference = generateTransactionReference();

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference,
          type: "withdrawal",
          status: "pending", // pending approval
          amount: dto.amount,
          customerId: customer.id,
          walletId: wallet.id,
          initiatedById: initiatedBy.id,
          description: `Withdrawal Request to ${dto.disbursementPhone} (${dto.disbursementMethod})`,
        },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          customerId: customer.id,
          amount: dto.amount,
          status: "requested", // status requested
          disbursementMethod: dto.disbursementMethod as PaymentMethod,
          disbursementPhone: dto.disbursementPhone,
        },
      });

      return { transaction, withdrawal };
    });

    await this.notificationQueue.add("withdrawal-requested", {
      tenantId,
      transactionId: result.transaction.id,
      reference,
      amount: dto.amount,
    });

    this.financialEvents.log({
      event: "withdrawal.requested",
      tenantId,
      transactionId: result.transaction.id,
      reference,
      amount: dto.amount,
      customerId: customer.id,
      userId: initiatedBy.id,
      status: "requested",
    });

    return this.prisma.transaction.findUnique({
      where: { id: result.transaction.id },
      include: { withdrawal: true },
    });
  }

  async approve(
    tenantId: string,
    transactionId: string,
    approvedBy: AuthenticatedUser,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        tenantId,
        type: "withdrawal",
        status: "pending",
      },
      include: { withdrawal: true, wallet: true },
    });
    if (!transaction)
      throw new NotFoundException("Pending withdrawal transaction not found");

    const withdrawal = transaction.withdrawal;
    if (!withdrawal || withdrawal.status !== "requested") {
      throw new BadRequestException("Withdrawal request not in pending state");
    }

    // Final balance check before completing the withdrawal!
    const walletBalance = await this.ledger.getWalletBalance(
      transaction.walletId!,
    );
    if (walletBalance < Number(transaction.amount)) {
      throw new BadRequestException(
        `Insufficient funds to approve. Current balance is GHS ${walletBalance.toFixed(2)}`,
      );
    }

    const reference = transaction.reference;
    const amount = Number(transaction.amount);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTxn = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      const updatedWd = await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "completed",
          approvedById: approvedBy.id,
          approvedAt: new Date(),
          gatewayReference: `MOCK-WD-${reference}`,
        },
      });

      return { transaction: updatedTxn, withdrawal: updatedWd };
    });

    // Post double-entry ledger entries
    const platformCash = await this.ledger.getAccountByCode(tenantId, "1000");
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId: transaction.walletId! },
    });

    if (!customerAccount) throw new Error("Customer ledger account not found");

    // Debit: Customer Wallet Account (liability decreases)
    // Credit: Platform Cash Account (asset decreases)
    await this.ledger.postEntries(tenantId, transactionId, [
      {
        accountId: customerAccount.id,
        entryType: "debit",
        amount,
        description: `Withdrawal ${reference}`,
      },
      {
        accountId: platformCash.id,
        entryType: "credit",
        amount,
        description: `Withdrawal ${reference}`,
      },
    ]);

    await this.notificationQueue.add("withdrawal-approved", {
      tenantId,
      transactionId,
      reference,
      amount,
    });

    this.financialEvents.log({
      event: "withdrawal.approved",
      tenantId,
      transactionId,
      reference,
      amount,
      customerId: transaction.customerId ?? undefined,
      userId: approvedBy.id,
      status: "completed",
    });

    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { withdrawal: true },
    });
  }

  async reject(
    tenantId: string,
    transactionId: string,
    rejectionReason: string,
    rejectedBy: AuthenticatedUser,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        tenantId,
        type: "withdrawal",
        status: "pending",
      },
      include: { withdrawal: true },
    });
    if (!transaction)
      throw new NotFoundException("Pending withdrawal transaction not found");

    const withdrawal = transaction.withdrawal;
    if (!withdrawal || withdrawal.status !== "requested") {
      throw new BadRequestException("Withdrawal request not in pending state");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "failed",
          completedAt: new Date(),
        },
      });

      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "rejected",
          rejectionReason,
          approvedById: rejectedBy.id,
          approvedAt: new Date(),
        },
      });
    });

    await this.notificationQueue.add("withdrawal-rejected", {
      tenantId,
      transactionId,
      rejectionReason,
      reference: transaction.reference,
      amount: Number(transaction.amount),
    });

    this.financialEvents.log({
      event: "withdrawal.rejected",
      tenantId,
      transactionId,
      reference: transaction.reference,
      amount: Number(transaction.amount),
      customerId: transaction.customerId ?? undefined,
      userId: rejectedBy.id,
      status: "rejected",
      metadata: { rejectionReason },
    });

    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { withdrawal: true },
    });
  }
}
