import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LedgerService } from "../ledger/ledger.service";

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {}

  async getBalance(tenantId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, tenantId },
      include: {
        customer: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!wallet) throw new NotFoundException("Wallet not found");

    const balance = await this.ledger.getWalletBalance(walletId);

    const lastEntry = await this.prisma.ledgerEntry.findFirst({
      where: { account: { walletId } },
      orderBy: { createdAt: "desc" },
    });

    return {
      walletId: wallet.id,
      customerId: wallet.customerId,
      walletType: wallet.walletType,
      balance,
      currency: wallet.currency,
      lastTransactionAt: lastEntry?.createdAt || null,
    };
  }

  async getCustomerWallet(tenantId: string, customerId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { tenantId, customerId, walletType: "customer" },
    });
    if (!wallet) throw new NotFoundException("Customer wallet not found");
    return this.getBalance(tenantId, wallet.id);
  }

  /**
   * Digital passbook: totals + recent confirmed contributions
   * (replaces the paper collector/customer double book).
   */
  async getCustomerPassbook(tenantId: string, customerId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { tenantId, customerId, walletType: "customer" },
    });
    if (!wallet) throw new NotFoundException("Customer wallet not found");

    const balance = await this.ledger.getWalletBalance(wallet.id);

    const [depositsAgg, withdrawalsAgg, depositCount, recentDeposits] =
      await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            tenantId,
            customerId,
            type: "deposit",
            status: "completed",
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            tenantId,
            customerId,
            type: "withdrawal",
            status: "completed",
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.count({
          where: {
            tenantId,
            customerId,
            type: "deposit",
            status: "completed",
          },
        }),
        this.prisma.transaction.findMany({
          where: {
            tenantId,
            customerId,
            type: "deposit",
            status: "completed",
          },
          orderBy: { completedAt: "desc" },
          take: 60,
          select: {
            id: true,
            reference: true,
            amount: true,
            completedAt: true,
            createdAt: true,
            description: true,
            payment: {
              select: {
                paymentMethod: true,
                gateway: true,
                payerPhone: true,
              },
            },
          },
        }),
      ]);

    const pendingWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        customerId,
        status: { in: ["requested", "approved", "processing"] },
      },
      _sum: { amount: true },
    });

    const totalDeposited = Number(depositsAgg._sum.amount || 0);
    const totalWithdrawn = Number(withdrawalsAgg._sum.amount || 0);
    const pendingWithdrawalAmount = Number(pendingWithdrawals._sum.amount || 0);

    return {
      walletId: wallet.id,
      customerId,
      currency: wallet.currency,
      balance,
      availableBalance: balance - pendingWithdrawalAmount,
      pendingWithdrawalAmount,
      totalDeposited,
      totalWithdrawn,
      depositCount,
      entries: recentDeposits.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        amount: Number(tx.amount),
        paidAt: tx.completedAt || tx.createdAt,
        description: tx.description,
        method: tx.payment?.paymentMethod ?? null,
        gateway: tx.payment?.gateway ?? null,
        payerPhone: tx.payment?.payerPhone ?? null,
      })),
    };
  }
}
