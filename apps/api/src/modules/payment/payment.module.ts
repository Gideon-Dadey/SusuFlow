import { Module } from '@nestjs/common';
import { HubtelGateway } from './gateways/hubtel.gateway';
import { PAYMENT_GATEWAY } from './gateways/payment-gateway.interface';

@Module({
  providers: [
    HubtelGateway,
    { provide: PAYMENT_GATEWAY, useExisting: HubtelGateway },
  ],
  exports: [PAYMENT_GATEWAY, HubtelGateway],
})
export class PaymentModule {}
