import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [
    LedgerModule,
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [WithdrawalController],
  providers: [WithdrawalService],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
