import {
  Injectable,
  BadRequestException,
  ConflictException,
  Inject,
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
  allocateTransactionReference,
  AuthenticatedUser,
  ROLES,
  clampPageLimit,
} from "@susuflow/shared";
import { PaymentMethod } from "@susuflow/database";
import { FinancialEventService } from "../../common/services/financial-event.service";
import { AuditService } from "../audit/audit.service";
import { enqueueNotification } from "../../common/notifications/enqueue";
import {
  PAYMENT_GATEWAY,
  PaymentGateway,
} from "../payment/gateways/payment-gateway.interface";
import { assertCustomerKycVerified } from "../../common/utils/assert-customer-kyc";
import { assertWithdrawalMaturityAllowed } from "../../common/utils/assert-withdrawal-maturity";

@Injectable()
export class WithdrawalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
    private readonly financialEvents: FinancialEventService,
    private readonly audit: AuditService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async create(
    tenantId: string,
    dto: CreateWithdrawalDto,
    initiatedBy: AuthenticatedUser,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
      include: {
        wallets: { where: { walletType: "customer" } },
        user: { select: { firstName: true, lastName: true } },
      },
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

    const reference = await allocateTransactionReference(async (value) =>
      Boolean(
        await this.prisma.transaction.findUnique({
          where: { reference: value },
        }),
      ),
    );

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
          gatewayReference: `STAFF-WD-${reference}`,
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

    await enqueueNotification(
      this.notificationQueue,
      "withdrawal-completed",
      {
        tenantId,
        transactionId: result.transaction.id,
        reference,
        amount: dto.amount,
      },
      result.transaction.id,
    );

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

    await this.audit.log({
      tenantId,
      userId: initiatedBy.id,
      action: "withdrawal:record",
      resourceType: "transaction",
      resourceId: result.transaction.id,
      afterState: {
        reference,
        amount: dto.amount,
        customerId: customer.id,
        customerName:
          `${customer.user?.firstName ?? ""} ${customer.user?.lastName ?? ""}`.trim(),
        customerNumber: customer.customerNumber,
        status: "completed",
      },
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
    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { withdrawal: true },
      });
      if (existing) {
        if (
          existing.type !== "withdrawal" ||
          existing.tenantId !== tenantId ||
          Number(existing.amount) !== Number(dto.amount)
        ) {
          throw new ConflictException("Idempotency key reuse conflict");
        }
        // Same intent — return the original transaction (safe retries).
        return existing;
      }
    }

    const customer = await this.prisma.customer.findFirst({
      where: { userId: initiatedBy.id, tenantId },
      include: { wallets: { where: { walletType: "customer" } } },
    });
    if (!customer) throw new NotFoundException("Customer profile not found");

    await assertCustomerKycVerified(this.prisma, tenantId, customer.id);
    await assertWithdrawalMaturityAllowed(this.prisma, tenantId, customer.id);

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

    // BR-W-004: daily withdrawal limit GHS 10,000 per customer
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailySum = await this.prisma.withdrawal.aggregate({
      where: {
        customerId: customer.id,
        status: { in: ["requested", "approved", "processing", "completed"] },
        createdAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    });
    const dailyTotal = Number(dailySum._sum.amount || 0) + dto.amount;
    if (dailyTotal > 10_000) {
      throw new BadRequestException(
        "Daily withdrawal limit of GHS 10,000 exceeded",
      );
    }

    const reference = await allocateTransactionReference(async (value) =>
      Boolean(
        await this.prisma.transaction.findUnique({
          where: { reference: value },
        }),
      ),
    );

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
          idempotencyKey: dto.idempotencyKey,
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

    await enqueueNotification(
      this.notificationQueue,
      "withdrawal-requested",
      {
        tenantId,
        transactionId: result.transaction.id,
        reference,
        amount: dto.amount,
      },
      result.transaction.id,
    );

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

    await this.audit.log({
      tenantId,
      userId: initiatedBy.id,
      action: "withdrawal:request",
      resourceType: "transaction",
      resourceId: result.transaction.id,
      afterState: {
        reference,
        amount: dto.amount,
        customerId: customer.id,
        status: "pending",
      },
    });

    return this.prisma.transaction.findUnique({
      where: { id: result.transaction.id },
      include: { withdrawal: true },
    });
  }

  /**
   * Org approval → payment-rail disbursement → ledger only after cash-out succeeds.
   * Customer never receives wallet debit until MoMo/bank payout is accepted.
   */
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
      include: {
        withdrawal: true,
        wallet: true,
        customer: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!transaction)
      throw new NotFoundException("Pending withdrawal transaction not found");

    const withdrawal = transaction.withdrawal;
    if (!withdrawal || withdrawal.status !== "requested") {
      throw new BadRequestException("Withdrawal request not in pending state");
    }

    if (!withdrawal.disbursementPhone) {
      throw new BadRequestException("Withdrawal is missing a payout phone");
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

    // Mark processing before calling the PSP (idempotent audit trail).
    await this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "processing",
          approvedById: approvedBy.id,
          approvedAt: new Date(),
        },
      });
    });

    const recipientName =
      `${transaction.customer?.user?.firstName ?? ""} ${transaction.customer?.user?.lastName ?? ""}`.trim() ||
      "SusuFlow Customer";

    const disbursement = await this.gateway.disburseFunds({
      amount,
      phone: withdrawal.disbursementPhone,
      reference,
      paymentMethod: withdrawal.disbursementMethod,
      recipientName,
      description: `Withdrawal ${reference}`,
    });

    if (disbursement.status === "failed" || !disbursement.success) {
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: "failed", completedAt: new Date() },
        });
        await tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "failed",
            rejectionReason:
              disbursement.message || "Disbursement failed at payment provider",
            gatewayReference: disbursement.gatewayReference,
          },
        });
      });

      await enqueueNotification(
        this.notificationQueue,
        "withdrawal-rejected",
        {
          tenantId,
          transactionId,
          rejectionReason:
            disbursement.message || "Payout failed. Please contact support.",
          reference,
          amount,
        },
        transactionId,
      );

      this.financialEvents.log({
        event: "withdrawal.disbursement_failed",
        tenantId,
        transactionId,
        reference,
        amount,
        customerId: transaction.customerId ?? undefined,
        userId: approvedBy.id,
        status: "failed",
        metadata: { message: disbursement.message },
      });

      await this.audit.log({
        tenantId,
        userId: approvedBy.id,
        action: "withdrawal:disbursement_failed",
        resourceType: "transaction",
        resourceId: transactionId,
        afterState: {
          reference,
          amount,
          status: "failed",
          message: disbursement.message,
        },
      });

      throw new BadRequestException(
        disbursement.message ||
          "Payout failed. The customer balance was not debited.",
      );
    }

    if (disbursement.status === "pending") {
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "processing",
          gatewayReference: disbursement.gatewayReference,
        },
      });

      this.financialEvents.log({
        event: "withdrawal.disbursement_pending",
        tenantId,
        transactionId,
        reference,
        amount,
        customerId: transaction.customerId ?? undefined,
        userId: approvedBy.id,
        status: "processing",
        metadata: { gatewayReference: disbursement.gatewayReference },
      });

      return this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { withdrawal: true },
      });
    }

    return this.finalizeSuccessfulDisbursement({
      tenantId,
      transactionId,
      withdrawalId: withdrawal.id,
      walletId: transaction.walletId!,
      customerId: transaction.customerId,
      reference,
      amount,
      gatewayReference: disbursement.gatewayReference || `WD-${reference}`,
      actorId: approvedBy.id,
    });
  }

  /** Completes a processing withdrawal after PSP confirms send-money success. */
  async confirmDisbursement(
    reference: string,
    gatewayReference: string,
    amount?: number,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { reference, type: "withdrawal" },
      include: { withdrawal: true },
    });
    if (!transaction?.withdrawal) {
      throw new NotFoundException("Withdrawal not found for disbursement");
    }

    if (transaction.withdrawal.status === "completed") {
      return transaction;
    }

    if (transaction.withdrawal.status !== "processing") {
      throw new BadRequestException(
        "Withdrawal is not awaiting disbursement confirmation",
      );
    }

    if (
      amount !== undefined &&
      Math.abs(Number(transaction.amount) - Number(amount)) > 0.009
    ) {
      throw new BadRequestException("Disbursement amount mismatch");
    }

    return this.finalizeSuccessfulDisbursement({
      tenantId: transaction.tenantId,
      transactionId: transaction.id,
      withdrawalId: transaction.withdrawal.id,
      walletId: transaction.walletId!,
      customerId: transaction.customerId,
      reference: transaction.reference,
      amount: Number(transaction.amount),
      gatewayReference,
      actorId: transaction.withdrawal.approvedById ?? undefined,
    });
  }

  async failDisbursement(reference: string, reason: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { reference, type: "withdrawal" },
      include: { withdrawal: true },
    });
    if (!transaction?.withdrawal) {
      throw new NotFoundException("Withdrawal not found for disbursement");
    }
    if (transaction.withdrawal.status === "completed") {
      return transaction;
    }
    if (transaction.withdrawal.status !== "processing") {
      throw new BadRequestException("Withdrawal is not processing");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "failed", completedAt: new Date() },
      });
      await tx.withdrawal.update({
        where: { id: transaction.withdrawal!.id },
        data: {
          status: "failed",
          rejectionReason: reason,
        },
      });
    });

    await enqueueNotification(
      this.notificationQueue,
      "withdrawal-rejected",
      {
        tenantId: transaction.tenantId,
        transactionId: transaction.id,
        rejectionReason: reason,
        reference: transaction.reference,
        amount: Number(transaction.amount),
      },
      transaction.id,
    );

    return this.prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { withdrawal: true },
    });
  }

  private async finalizeSuccessfulDisbursement(input: {
    tenantId: string;
    transactionId: string;
    withdrawalId: string;
    walletId: string;
    customerId: string | null;
    reference: string;
    amount: number;
    gatewayReference: string;
    actorId?: string;
  }) {
    const {
      tenantId,
      transactionId,
      withdrawalId,
      walletId,
      customerId,
      reference,
      amount,
      gatewayReference,
      actorId,
    } = input;

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "completed",
          gatewayReference,
        },
      });
    });

    const platformCash = await this.ledger.getAccountByCode(tenantId, "1000");
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId },
    });

    if (!customerAccount) throw new Error("Customer ledger account not found");

    const existingEntries = await this.prisma.ledgerEntry.count({
      where: { transactionId },
    });
    if (existingEntries === 0) {
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
    }

    await enqueueNotification(
      this.notificationQueue,
      "withdrawal-approved",
      {
        tenantId,
        transactionId,
        reference,
        amount,
      },
      transactionId,
    );

    this.financialEvents.log({
      event: "withdrawal.approved",
      tenantId,
      transactionId,
      reference,
      amount,
      customerId: customerId ?? undefined,
      userId: actorId,
      status: "completed",
    });

    await this.audit.log({
      tenantId,
      userId: actorId,
      action: "withdrawal:approve",
      resourceType: "transaction",
      resourceId: transactionId,
      afterState: {
        reference,
        amount,
        customerId,
        status: "completed",
        gatewayReference,
      },
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

    await enqueueNotification(
      this.notificationQueue,
      "withdrawal-rejected",
      {
        tenantId,
        transactionId,
        rejectionReason,
        reference: transaction.reference,
        amount: Number(transaction.amount),
      },
      transactionId,
    );

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

    await this.audit.log({
      tenantId,
      userId: rejectedBy.id,
      action: "withdrawal:reject",
      resourceType: "transaction",
      resourceId: transactionId,
      afterState: {
        reference: transaction.reference,
        amount: Number(transaction.amount),
        customerId: transaction.customerId,
        status: "rejected",
        rejectionReason,
      },
    });

    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { withdrawal: true },
    });
  }
}
