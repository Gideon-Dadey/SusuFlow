import { Controller, Post, Body, Headers, HttpCode, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { BillingService, PaystackService } from './billing.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class BillingWebhookController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paystack: PaystackService,
  ) {}

  @Public()
  @Post('paystack')
  @HttpCode(200)
  @ApiOperation({ summary: 'Paystack subscription payment webhook' })
  async handlePaystack(
    @Body() body: {
      event: string;
      data: {
        reference: string;
        amount: number;
        metadata?: { tenant_id?: string; plan?: string; type?: string };
      };
    },
    @Headers('x-paystack-signature') signature: string,
  ) {
    const raw = JSON.stringify(body);
    if (this.paystack.isConfigured && !this.paystack.verifyWebhookSignature(raw, signature || '')) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    if (body.event === 'charge.success') {
      await this.billingService.handleChargeSuccess({
        reference: body.data.reference,
        amount: body.data.amount,
        metadata: body.data.metadata,
      });
    }

    return { status: 'ok' };
  }

  @Public()
  @Post('billing/mock/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mock subscription payment (development only)' })
  async mockConfirm(@Body() body: { reference: string; tenantId: string }) {
    return this.billingService.confirmMockPayment(body.reference, body.tenantId);
  }
}
