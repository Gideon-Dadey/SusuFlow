import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
  ) {}

  async getBalance(tenantId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, tenantId },
      include: { customer: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const balance = await this.ledger.getWalletBalance(walletId);

    const lastEntry = await this.prisma.ledgerEntry.findFirst({
      where: { account: { walletId } },
      orderBy: { createdAt: 'desc' },
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
      where: { tenantId, customerId, walletType: 'customer' },
    });
    if (!wallet) throw new NotFoundException('Customer wallet not found');
    return this.getBalance(tenantId, wallet.id);
  }
}
