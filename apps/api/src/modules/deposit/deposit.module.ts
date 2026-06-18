import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { PaymentWebhookController } from '../payment/webhooks/payment-webhook.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    LedgerModule,
    PaymentModule,
    BullModule.registerQueue({ name: 'notifications' }, { name: 'receipts' }),
  ],
  controllers: [DepositController, PaymentWebhookController],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}
