import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LedgerService', () => {
  let service: LedgerService;
  let prisma: {
    ledgerEntry: { createMany: jest.Mock; groupBy: jest.Mock };
    account: { findUnique: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      ledgerEntry: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
        groupBy: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LedgerService);
  });

  describe('postEntries', () => {
    const tenantId = 'tenant-1';
    const transactionId = 'txn-1';

    it('posts balanced debit and credit entries', async () => {
      const entries = [
        { accountId: 'acc-1', entryType: 'debit' as const, amount: 100 },
        { accountId: 'acc-2', entryType: 'credit' as const, amount: 100 },
      ];

      await service.postEntries(tenantId, transactionId, entries);

      expect(prisma.ledgerEntry.createMany).toHaveBeenCalledWith({
        data: entries.map((e) => ({
          tenantId,
          transactionId,
          accountId: e.accountId,
          entryType: e.entryType,
          amount: e.amount,
          description: undefined,
          reversalOfId: undefined,
        })),
      });
    });

    it('rejects imbalanced entries', async () => {
      await expect(
        service.postEntries(tenantId, transactionId, [
          { accountId: 'acc-1', entryType: 'debit', amount: 100 },
          { accountId: 'acc-2', entryType: 'credit', amount: 50 },
        ]),
      ).rejects.toThrow('Ledger imbalance');
    });

    it('allows multiple debits and credits when balanced', async () => {
      await service.postEntries(tenantId, transactionId, [
        { accountId: 'a1', entryType: 'debit', amount: 60 },
        { accountId: 'a2', entryType: 'debit', amount: 40 },
        { accountId: 'a3', entryType: 'credit', amount: 100 },
      ]);

      expect(prisma.ledgerEntry.createMany).toHaveBeenCalled();
    });
  });

  describe('getAccountBalance', () => {
    it('calculates liability account balance from credits', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'acc-1',
        accountType: 'liability',
      });
      prisma.ledgerEntry.groupBy.mockResolvedValue([
        { entryType: 'credit', _sum: { amount: 150 } },
        { entryType: 'debit', _sum: { amount: 30 } },
      ]);

      const balance = await service.getAccountBalance('acc-1');
      expect(balance).toBe(120);
    });

    it('calculates asset account balance from debits', async () => {
      prisma.account.findUnique.mockResolvedValue({
        id: 'acc-1',
        accountType: 'asset',
      });
      prisma.ledgerEntry.groupBy.mockResolvedValue([
        { entryType: 'debit', _sum: { amount: 200 } },
        { entryType: 'credit', _sum: { amount: 50 } },
      ]);

      const balance = await service.getAccountBalance('acc-1');
      expect(balance).toBe(150);
    });

    it('throws when account not found', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      await expect(service.getAccountBalance('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWalletBalance', () => {
    it('sums balances across wallet accounts', async () => {
      prisma.account.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
      prisma.account.findUnique
        .mockResolvedValueOnce({ id: 'a1', accountType: 'liability' })
        .mockResolvedValueOnce({ id: 'a2', accountType: 'liability' });
      prisma.ledgerEntry.groupBy
        .mockResolvedValueOnce([{ entryType: 'credit', _sum: { amount: 100 } }])
        .mockResolvedValueOnce([{ entryType: 'credit', _sum: { amount: 50.555 } }]);

      const balance = await service.getWalletBalance('wallet-1');
      expect(balance).toBe(150.56);
    });
  });

  describe('getAccountByCode', () => {
    it('returns account when found', async () => {
      prisma.account.findUnique.mockResolvedValue({ id: '1', code: '1000' });
      const account = await service.getAccountByCode('tenant-1', '1000');
      expect(account.code).toBe('1000');
    });

    it('throws when account missing', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      await expect(service.getAccountByCode('tenant-1', '9999')).rejects.toThrow(NotFoundException);
    });
  });
});
