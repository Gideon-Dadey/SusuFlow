import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType, EntryType } from '@susuflow/database';

interface LedgerEntryInput {
  accountId: string;
  entryType: EntryType;
  amount: number;
  description?: string;
  reversalOfId?: string;
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async postEntries(
    tenantId: string,
    transactionId: string,
    entries: LedgerEntryInput[],
  ) {
    const totalDebits = entries
      .filter((e) => e.entryType === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredits = entries
      .filter((e) => e.entryType === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      throw new Error(`Ledger imbalance: debits=${totalDebits}, credits=${totalCredits}`);
    }

    return this.prisma.ledgerEntry.createMany({
      data: entries.map((e) => ({
        tenantId,
        transactionId,
        accountId: e.accountId,
        entryType: e.entryType,
        amount: e.amount,
        description: e.description,
        reversalOfId: e.reversalOfId,
      })),
    });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');

    const sums = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: { accountId },
      _sum: { amount: true },
    });

    const debitTotal = Number(sums.find((s) => s.entryType === 'debit')?._sum?.amount ?? 0);
    const creditTotal = Number(sums.find((s) => s.entryType === 'credit')?._sum?.amount ?? 0);
    const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);

    return isNormalCredit ? creditTotal - debitTotal : debitTotal - creditTotal;
  }

  async getWalletBalance(walletId: string): Promise<number> {
    const accounts = await this.prisma.account.findMany({ where: { walletId } });
    let total = 0;
    for (const account of accounts) {
      total += await this.getAccountBalance(account.id);
    }
    return Math.round(total * 100) / 100;
  }

  async getAccountByCode(tenantId: string, code: string) {
    const account = await this.prisma.account.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });
    if (!account) throw new NotFoundException(`Account ${code} not found`);
    return account;
  }
}
