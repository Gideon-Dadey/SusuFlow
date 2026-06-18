import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@susuflow/database';
import { isValidUuid } from '../config/validate-env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async setTenantContext(tenantId: string) {
    if (!isValidUuid(tenantId)) {
      throw new BadRequestException('Invalid tenant context');
    }
    // Parameterized query — prevents SQL injection via tenant_id
    await this.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  }
}
