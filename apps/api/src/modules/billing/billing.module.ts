import { Module } from '@nestjs/common';
import { BillingService, PaystackService } from './billing.service';
import { BillingWebhookController } from './billing.controller';
import { AdminBillingController } from './admin-billing.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [BillingWebhookController, AdminBillingController],
  providers: [PaystackService, BillingService],
  exports: [BillingService, PaystackService],
})
export class BillingModule {}
