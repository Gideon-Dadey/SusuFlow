import { BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
    service.$executeRaw = jest.fn().mockResolvedValue(undefined);
  });

  describe('setTenantContext', () => {
    it('sets tenant context with parameterized query for valid UUID', async () => {
      const tenantId = '00000000-0000-0000-0000-000000000001';
      await service.setTenantContext(tenantId);
      expect(service.$executeRaw).toHaveBeenCalled();
    });

    it('rejects invalid tenant ID (SQL injection attempt)', async () => {
      const malicious = "'; DROP TABLE users; --";
      await expect(service.setTenantContext(malicious)).rejects.toThrow(BadRequestException);
      expect(service.$executeRaw).not.toHaveBeenCalled();
    });

    it('rejects non-UUID strings', async () => {
      await expect(service.setTenantContext('not-a-uuid')).rejects.toThrow(BadRequestException);
    });
  });
});
