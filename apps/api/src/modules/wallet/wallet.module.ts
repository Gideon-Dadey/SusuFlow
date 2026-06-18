import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController, CustomerWalletController } from './wallet.controller';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [WalletController, CustomerWalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
