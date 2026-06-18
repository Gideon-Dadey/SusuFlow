import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('TenantService', () => {
  let service: TenantService;
  const prisma = {
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: { findUnique: jest.fn() },
    user: { findFirst: jest.fn(), create: jest.fn() },
    userRole: { create: jest.fn() },
    subscription: { create: jest.fn(), update: jest.fn() },
    account: { create: jest.fn() },
    $transaction: jest.fn(),
  };
  const cache = { del: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: prisma },
        { provide: CacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(TenantService);
  });

  describe('assertTenantOperational', () => {
    it('throws when tenant is suspended', async () => {
      prisma.tenant.findUnique.mockResolvedValue({
        id: 't1',
        status: 'suspended',
        subscription: null,
      });

      await expect(service.assertTenantOperational('t1')).rejects.toThrow(BadRequestException);
    });

    it('throws when trial expired and not active', async () => {
      prisma.tenant.findUnique.mockResolvedValue({
        id: 't1',
        status: 'trial',
        subscription: {
          status: 'trialing',
          trialEnd: new Date('2020-01-01'),
        },
      });

      await expect(service.assertTenantOperational('t1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('activate', () => {
    it('throws when tenant not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.activate('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('throws when slug already exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({
          slug: 'abc-susu',
          name: 'ABC',
          email: 'a@b.com',
          adminFirstName: 'A',
          adminLastName: 'B',
          adminEmail: 'admin@abc.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
