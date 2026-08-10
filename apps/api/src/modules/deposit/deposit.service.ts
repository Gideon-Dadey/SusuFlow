import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LedgerService } from "../ledger/ledger.service";
import { CreateDepositDto } from "./dto/deposit.dto";
import {
  generateTransactionReference,
  MIN_DEPOSIT_AMOUNT,
  MAX_DEPOSIT_AMOUNT,
  DEPOSIT_EXPIRY_MINUTES,
  AuthenticatedUser,
  clampPageLimit,
  ROLES,
  findGhanaBank,
  isLiveCustomerDepositMethod,
  isMobileMoneyDepositMethod,
  isValidGhanaPhone,
  normalizeGhanaPhone,
} from "@susuflow/shared";
import {
  PAYMENT_GATEWAY,
  PaymentGateway,
} from "../payment/gateways/payment-gateway.interface";
import { ConfigService } from "@nestjs/config";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { FinancialEventService } from "../../common/services/financial-event.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class DepositService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly config: ConfigService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
    @InjectQueue("receipts") private readonly receiptQueue: Queue,
    private readonly financialEvents: FinancialEventService,
    private readonly audit: AuditService,
  ) {}

  async initiate(
    tenantId: string,
    dto: CreateDepositDto,
    initiatedBy: AuthenticatedUser,
  ) {
    if (dto.amount < MIN_DEPOSIT_AMOUNT || dto.amount > MAX_DEPOSIT_AMOUNT) {
      throw new BadRequestException(
        `Amount must be between ${MIN_DEPOSIT_AMOUNT} and ${MAX_DEPOSIT_AMOUNT}`,
      );
    }

    if (!isLiveCustomerDepositMethod(dto.paymentMethod)) {
      throw new BadRequestException(
        "That payment method is not available yet. Choose MoMo or bank transfer.",
      );
    }

    const isBank = dto.paymentMethod === "bank_transfer";
    const bank = isBank ? findGhanaBank(dto.bankCode) : null;
    if (isBank && !bank) {
      throw new BadRequestException("Select a supported Ghana bank.");
    }

    let payerPhone: string | undefined;
    if (dto.payerPhone?.trim()) {
      const normalized = normalizeGhanaPhone(dto.payerPhone.trim());
      if (!isValidGhanaPhone(normalized)) {
        throw new BadRequestException(
          "Enter a valid Ghana phone number (e.g. 0241234567).",
        );
      }
      payerPhone = normalized;
    }

    if (isMobileMoneyDepositMethod(dto.paymentMethod) && !payerPhone) {
      throw new BadRequestException(
        "Enter the mobile money number that will approve this payment.",
      );
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) throw new ConflictException("Duplicate deposit request");
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, tenantId },
      include: { wallets: { where: { walletType: "customer" } } },
    });
    if (!customer) throw new NotFoundException("Customer not found");

    if (
      initiatedBy.roles.includes(ROLES.COLLECTOR) &&
      customer.collectorId !== initiatedBy.id
    ) {
      throw new BadRequestException(
        "You can only collect deposits for customers assigned to you",
      );
    }

    const wallet = customer.wallets[0];
    if (!wallet) throw new NotFoundException("Customer wallet not found");

    const reference = generateTransactionReference();
    const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRY_MINUTES * 60 * 1000);

    const isCollectorAssisted = initiatedBy.roles.includes("collector");
    const methodLabel = isBank
      ? `bank_transfer:${bank!.code}`
      : dto.paymentMethod;

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference,
          type: "deposit",
          status: "pending",
          amount: dto.amount,
          customerId: customer.id,
          walletId: wallet.id,
          initiatedById: initiatedBy.id,
          collectorId: isCollectorAssisted ? initiatedBy.id : dto.collectorId,
          idempotencyKey: dto.idempotencyKey,
          description: `Deposit via ${methodLabel}`,
          metadata: isBank
            ? {
                paymentChannel: "bank_transfer",
                bankCode: bank!.code,
                bankName: bank!.name,
              }
            : { paymentChannel: dto.paymentMethod },
        },
      });

      const payment = await tx.payment.create({
        data: {
          tenantId,
          transactionId: transaction.id,
          gateway: "hubtel",
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          status: "initiated",
          payerPhone: payerPhone ?? null,
          expiresAt,
          gatewayResponse: isBank
            ? {
                bankCode: bank!.code,
                bankName: bank!.name,
              }
            : undefined,
        },
      });

      return { transaction, payment };
    });

    const session = await this.gateway.initiatePayment({
      amount: dto.amount,
      currency: "GHS",
      reference,
      payerPhone,
      paymentMethod: dto.paymentMethod,
      bankCode: bank?.code,
      bankName: bank?.name,
      callbackUrl: `${this.config.get("API_URL")}/api/v1/webhooks/hubtel`,
      description: isBank
        ? `SusuFlow deposit ${reference} via ${bank!.name}`
        : `SusuFlow deposit ${reference}`,
    });

    await this.prisma.payment.update({
      where: { id: result.payment.id },
      data: {
        gatewayReference: session.gatewayReference,
        status: "pending",
        gatewayResponse: {
          ...(isBank ? { bankCode: bank!.code, bankName: bank!.name } : {}),
          ...(session.bankTransfer
            ? { bankTransfer: session.bankTransfer }
            : {}),
          sessionId: session.sessionId,
        } as object,
      },
    });

    this.financialEvents.log({
      event: "deposit.initiated",
      tenantId,
      transactionId: result.transaction.id,
      reference,
      amount: dto.amount,
      customerId: customer.id,
      userId: initiatedBy.id,
      status: "pending",
    });

    await this.audit.log({
      tenantId,
      userId: initiatedBy.id,
      action: "deposit:initiate",
      resourceType: "transaction",
      resourceId: result.transaction.id,
      afterState: {
        reference,
        amount: dto.amount,
        customerId: customer.id,
        collectorId: isCollectorAssisted ? initiatedBy.id : dto.collectorId,
        paymentMethod: dto.paymentMethod,
        bankCode: bank?.code,
        payerPhone,
      },
    });

    return {
      transactionId: result.transaction.id,
      reference,
      status: "pending",
      payment: {
        id: result.payment.id,
        gateway: "hubtel",
        paymentUrl: session.paymentUrl,
        expiresAt: session.expiresAt,
        bankTransfer: session.bankTransfer ?? null,
      },
    };
  }

  async confirmPayment(
    reference: string,
    gatewayReference: string,
    amount: number,
    payerPhone?: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { reference },
      include: { payment: true, wallet: true },
    });

    if (!transaction) throw new NotFoundException("Transaction not found");
    if (transaction.status === "completed") return transaction;

    const tenantId = transaction.tenantId;

    await this.ledger.ensureChartOfAccounts(tenantId);

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: transaction.payment!.id },
        data: {
          status: "success",
          gatewayReference,
          payerPhone,
          webhookReceivedAt: new Date(),
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "completed", completedAt: new Date() },
      });
    });

    const platformCash = await this.ledger.getAccountByCode(tenantId, "1000");
    const customerAccount = await this.prisma.account.findFirst({
      where: { walletId: transaction.walletId! },
    });

    if (!customerAccount) throw new Error("Customer ledger account not found");

    await this.ledger.postEntries(tenantId, transaction.id, [
      {
        accountId: platformCash.id,
        entryType: "debit",
        amount,
        description: `Deposit ${reference}`,
      },
      {
        accountId: customerAccount.id,
        entryType: "credit",
        amount,
        description: `Deposit ${reference}`,
      },
    ]);

    if (transaction.collectorId) {
      const settings = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      const commissionRate =
        (settings?.settings as Record<string, number>)?.commission_rate || 0.01;
      const commission = Math.round(amount * commissionRate * 100) / 100;

      if (commission > 0) {
        const commissionExpense = await this.ledger.getAccountByCode(
          tenantId,
          "5000",
        );
        const commissionPayable = await this.ledger.getAccountByCode(
          tenantId,
          "1200",
        );

        await this.ledger.postEntries(tenantId, transaction.id, [
          {
            accountId: commissionExpense.id,
            entryType: "debit",
            amount: commission,
            description: "Collector commission",
          },
          {
            accountId: commissionPayable.id,
            entryType: "credit",
            amount: commission,
            description: "Collector commission",
          },
        ]);
      }
    }

    await this.notificationQueue.add("deposit-confirmed", {
      tenantId,
      transactionId: transaction.id,
      reference,
      amount,
    });

    await this.receiptQueue.add("generate-receipt", {
      tenantId,
      transactionId: transaction.id,
      reference,
      amount,
    });

    this.financialEvents.log({
      event: "deposit.completed",
      tenantId,
      transactionId: transaction.id,
      reference,
      amount,
      customerId: transaction.customerId ?? undefined,
      status: "completed",
    });

    return this.prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: { payment: true },
    });
  }

  async findAll(
    tenantId: string,
    options: {
      status?: string;
      customerId?: string;
      cursor?: string;
      limit?: number;
    },
    user?: AuthenticatedUser,
  ) {
    const limit = clampPageLimit(options.limit);
    const where: Record<string, unknown> = { tenantId, type: "deposit" };
    if (options.status) where.status = options.status;

    if (user?.roles.includes(ROLES.CUSTOMER)) {
      const customer = await this.prisma.customer.findFirst({
        where: { userId: user.id, tenantId },
      });
      if (!customer) throw new NotFoundException("Customer profile not found");
      where.customerId = customer.id;
    } else if (user?.roles.includes(ROLES.COLLECTOR)) {
      where.collectorId = user.id;
    } else if (options.customerId) {
      where.customerId = options.customerId;
    }

    const items = await this.prisma.transaction.findMany({
      where,
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        payment: true,
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

  async findOne(tenantId: string, id: string) {
    const txn = await this.prisma.transaction.findFirst({
      where: { id, tenantId, type: "deposit" },
      include: { payment: true, ledgerEntries: { include: { account: true } } },
    });
    if (!txn) throw new NotFoundException("Deposit not found");
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
      throw new NotFoundException("Transaction not found or invalid reference");
    }

    // Set tenant context to this transaction's tenant so any RLS checks in this execution thread pass.
    await this.prisma.setTenantContext(transaction.tenantId);

    return transaction;
  }
}
