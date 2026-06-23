import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { CacheModule } from '../../cache/cache.module';
import { DemoSeederService } from './demo-seeder.service';

@Module({
  imports: [CacheModule],
  controllers: [TenantController],
  providers: [TenantService, DemoSeederService],
  exports: [TenantService, DemoSeederService],
})
export class TenantModule {}

