import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountType, EntryType } from '@susuflow/database';
import { AuditService } from '../audit/audit.service';

interface LedgerEntryInput {
  accountId: string;
  entryType: EntryType;
  amount: number;
  description?: string;
  reversalOfId?: string;
}

@Injectable()
export class LedgerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}


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

  async getAccountsWithBalances(tenantId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { tenantId },
    });

    const entrySums = await this.prisma.ledgerEntry.groupBy({
      by: ['accountId', 'entryType'],
      where: { tenantId },
      _sum: { amount: true },
    });

    const sumMap: Record<string, { debit: number; credit: number }> = {};
    for (const sum of entrySums) {
      if (!sumMap[sum.accountId]) {
        sumMap[sum.accountId] = { debit: 0, credit: 0 };
      }
      sumMap[sum.accountId][sum.entryType as 'debit' | 'credit'] = Number(sum._sum.amount || 0);
    }

    return accounts.map((account) => {
      const sums = sumMap[account.id] || { debit: 0, credit: 0 };
      const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);
      const balance = isNormalCredit ? sums.credit - sums.debit : sums.debit - sums.credit;
      return {
        ...account,
        debitSum: sums.debit,
        creditSum: sums.credit,
        balance: Math.round(balance * 100) / 100,
      };
    });
  }

  async getCommissions(tenantId: string) {
    return this.prisma.transaction.findMany({
      where: {
        tenantId,
        OR: [
          { type: 'commission' },
          {
            type: 'deposit',
            collectorId: { not: null },
            status: 'completed',
          },
        ],
      },
      include: {
        collector: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        ledgerEntries: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async payoutCommission(
    tenantId: string,
    collectorId: string,
    amount: number,
    actorId: string,
    description?: string,
  ) {
    const sums = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: {
        tenantId,
        account: { code: '1200' },
        transaction: { collectorId },
      },
      _sum: { amount: true },
    });

    const debitTotal = Number(sums.find((s) => s.entryType === 'debit')?._sum?.amount ?? 0);
    const creditTotal = Number(sums.find((s) => s.entryType === 'credit')?._sum?.amount ?? 0);
    const availableBalance = creditTotal - debitTotal;

    if (amount > availableBalance) {
      throw new Error(`Insufficient commission balance. Available: GHS ${availableBalance}, Requested: GHS ${amount}`);
    }

    const ref = `PAY-COM-${Date.now()}`;
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          tenantId,
          reference: ref,
          type: 'commission',
          status: 'completed',
          amount,
          collectorId,
          description: description || `Commission payout of GHS ${amount}`,
        },
      });

      const commissionsPayable = await tx.account.findFirst({
        where: { tenantId, code: '1200' },
      });
      const platformCash = await tx.account.findFirst({
        where: { tenantId, code: '1000' },
      });

      if (!commissionsPayable || !platformCash) {
        throw new Error('Required chart of accounts (1000 or 1200) not found');
      }

      await tx.ledgerEntry.createMany({
        data: [
          {
            tenantId,
            transactionId: transaction.id,
            accountId: commissionsPayable.id,
            entryType: 'debit',
            amount,
            description: `Payout: ${ref}`,
          },
          {
            tenantId,
            transactionId: transaction.id,
            accountId: platformCash.id,
            entryType: 'credit',
            amount,
            description: `Payout: ${ref}`,
          },
        ],
      });

      await this.audit.log({
        tenantId,
        userId: actorId,
        action: 'ledger:commission_payout',
        resourceType: 'transaction',
        resourceId: transaction.id,
        afterState: { collectorId, amount, description },
      });

      return transaction;
    });
  }
}

