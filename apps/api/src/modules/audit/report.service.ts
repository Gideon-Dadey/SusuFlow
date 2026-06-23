import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    // 1. Total Deposits
    const depositSum = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        type: 'deposit',
        status: 'completed',
      },
    });
    const totalDeposits = Number(depositSum._sum.amount || 0);

    // 2. Total Withdrawals
    const withdrawalSum = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        type: 'withdrawal',
        status: 'completed',
      },
    });
    const totalWithdrawals = Number(withdrawalSum._sum.amount || 0);

    // 3. Outstanding Liability (Customer Wallets, code starts with '1100')
    const customerAccountEntries = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: {
        tenantId,
        account: {
          code: { startsWith: '1100' },
        },
      },
      _sum: { amount: true },
    });
    const customerDebits = Number(customerAccountEntries.find((e) => e.entryType === 'debit')?._sum.amount || 0);
    const customerCredits = Number(customerAccountEntries.find((e) => e.entryType === 'credit')?._sum.amount || 0);
    const outstandingLiability = Math.max(0, customerCredits - customerDebits);

    // 4. Collector Commissions Payable (code starts with '1200')
    const commissionEntries = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: {
        tenantId,
        account: {
          code: { startsWith: '1200' },
        },
      },
      _sum: { amount: true },
    });
    const commissionDebits = Number(commissionEntries.find((e) => e.entryType === 'debit')?._sum.amount || 0);
    const commissionCredits = Number(commissionEntries.find((e) => e.entryType === 'credit')?._sum.amount || 0);
    const collectorCommissionsPayable = Math.max(0, commissionCredits - commissionDebits);

    // 5. Total Commission Expense (code starts with '5000')
    const commissionExpenseEntries = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: {
        tenantId,
        account: {
          code: { startsWith: '5000' },
        },
      },
      _sum: { amount: true },
    });
    const expenseDebits = Number(commissionExpenseEntries.find((e) => e.entryType === 'debit')?._sum.amount || 0);
    const expenseCredits = Number(commissionExpenseEntries.find((e) => e.entryType === 'credit')?._sum.amount || 0);
    const totalCommissionExpense = Math.max(0, expenseDebits - expenseCredits);

    // 6. Platform Cash (code starts with '1000')
    const platformCashEntries = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: {
        tenantId,
        account: {
          code: { startsWith: '1000' },
        },
      },
      _sum: { amount: true },
    });
    const cashDebits = Number(platformCashEntries.find((e) => e.entryType === 'debit')?._sum.amount || 0);
    const cashCredits = Number(platformCashEntries.find((e) => e.entryType === 'credit')?._sum.amount || 0);
    const platformCash = cashDebits - cashCredits;

    // 7. Last 7 Days Trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: 'completed',
        createdAt: {
          gte: last7Days[0],
        },
      },
      select: {
        type: true,
        amount: true,
        createdAt: true,
      },
    });

    const dailyTrends = last7Days.map((date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayTxns = transactions.filter(
        (t) => t.createdAt >= date && t.createdAt < nextDate,
      );
      const deposits = dayTxns
        .filter((t) => t.type === 'deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const withdrawals = dayTxns
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        date: date.toISOString().split('T')[0],
        deposits: Math.round(deposits * 100) / 100,
        withdrawals: Math.round(withdrawals * 100) / 100,
      };
    });

    return {
      summary: {
        totalDeposits: Math.round(totalDeposits * 100) / 100,
        totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
        outstandingLiability: Math.round(outstandingLiability * 100) / 100,
        collectorCommissionsPayable: Math.round(collectorCommissionsPayable * 100) / 100,
        totalCommissionExpense: Math.round(totalCommissionExpense * 100) / 100,
        platformCash: Math.round(platformCash * 100) / 100,
        netOperationsBalance: Math.round((totalDeposits - totalWithdrawals) * 100) / 100,
      },
      dailyTrends,
    };
  }
}
