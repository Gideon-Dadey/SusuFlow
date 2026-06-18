import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Public } from '../../../common/decorators';
import { PAYMENT_GATEWAY, PaymentGateway } from '../gateways/payment-gateway.interface';
import { DepositService } from '../../deposit/deposit.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class PaymentWebhookController {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    private readonly depositService: DepositService,
  ) {}

  @Public()
  @Post('hubtel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Hubtel payment callback' })
  async handleHubtel(
    @Body() payload: unknown,
    @Headers('hubtel-callback-signature') signature: string,
  ) {
    const event = await this.gateway.verifyWebhook(payload, signature || '');

    if (event.status === 'success') {
      await this.depositService.confirmPayment(
        event.reference,
        event.gatewayReference,
        event.amount,
        event.payerPhone,
      );
    }

    return { status: 'ok' };
  }

  @Public()
  @Post('mock/confirm/:reference')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mock payment confirmation (dev only)' })
  async mockConfirm(@Body() body: { reference: string; amount: number }) {
    if (process.env.NODE_ENV === 'production') {
      return { status: 'disabled' };
    }
    await this.depositService.confirmPayment(
      body.reference,
      `MOCK-${body.reference}`,
      body.amount,
    );
    return { status: 'confirmed' };
  }
}
