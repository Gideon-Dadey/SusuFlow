import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { SUBSCRIPTION_PLAN_PRICES_GHS } from '@susuflow/shared';
import { TenantService } from '../tenant/tenant.service';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly webUrl: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.publicKey = this.config.get<string>('PAYSTACK_PUBLIC_KEY') || '';
    this.webUrl = this.config.get<string>('WEB_URL') || 'http://localhost:3000';
  }

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  buildSubscriptionReference(tenantId: string): string {
    return `susu_sub_${tenantId}_${Date.now()}_${randomBytes(4).toString('hex')}`;
  }

  parseTenantIdFromReference(reference: string): string | null {
    const match = reference.match(/^susu_sub_([0-9a-f-]{36})_/i);
    return match?.[1] ?? null;
  }

  async initializeCheckout(params: {
    tenantId: string;
    email: string;
    plan: 'starter' | 'growth' | 'enterprise';
    reference: string;
  }) {
    const amountGhs = SUBSCRIPTION_PLAN_PRICES_GHS[params.plan];
    if (amountGhs <= 0) {
      throw new BadRequestException(
        'This plan does not support self-serve checkout. Activate manually or contact sales.',
      );
    }

    if (!this.isConfigured) {
      return {
        mode: 'mock' as const,
        reference: params.reference,
        authorizationUrl: `${this.webUrl}/admin/tenants?mockPayment=${params.reference}&tenantId=${params.tenantId}`,
        amountGhs,
        message: 'Paystack not configured. Use mock payment URL in development',
      };
    }

    const amountPesewas = Math.round(amountGhs * 100);
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: amountPesewas,
        currency: 'GHS',
        reference: params.reference,
        callback_url: `${this.webUrl}/admin/tenants?payment=success`,
        metadata: {
          tenant_id: params.tenantId,
          plan: params.plan,
          type: 'subscription',
        },
      }),
    });

    const json = (await response.json()) as PaystackInitializeResponse;
    if (!json.status || !json.data?.authorization_url) {
      this.logger.error(`Paystack init failed: ${json.message}`);
      throw new BadRequestException(json.message || 'Failed to initialize payment');
    }

    return {
      mode: 'paystack' as const,
      reference: json.data.reference,
      authorizationUrl: json.data.authorization_url,
      amountGhs,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey) return false;
    const hash = createHmac('sha512', this.secretKey).update(payload).digest('hex');
    return hash === signature;
  }

  getPublicKey() {
    return this.publicKey;
  }
}

@Injectable()
export class BillingService {
  constructor(
    private readonly paystack: PaystackService,
    private readonly tenantService: TenantService,
  ) {}

  async initializeSubscriptionCheckout(tenantId: string) {
    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant.subscription) {
      throw new BadRequestException('Tenant has no subscription');
    }

    const reference = this.paystack.buildSubscriptionReference(tenantId);
    const checkout = await this.paystack.initializeCheckout({
      tenantId,
      email: tenant.email,
      plan: tenant.subscription.plan,
      reference,
    });

    return {
      tenantId,
      plan: tenant.subscription.plan,
      ...checkout,
    };
  }

  async handleChargeSuccess(payload: {
    reference: string;
    amount: number;
    metadata?: { tenant_id?: string; plan?: string; type?: string };
  }) {
    if (payload.metadata?.type && payload.metadata.type !== 'subscription') {
      return { handled: false };
    }

    const tenantId =
      payload.metadata?.tenant_id || this.paystack.parseTenantIdFromReference(payload.reference);
    if (!tenantId) {
      return { handled: false };
    }

    const amountGhs = payload.amount / 100;
    await this.tenantService.recordSubscriptionPayment(tenantId, payload.reference, amountGhs);
    return { handled: true, tenantId };
  }

  async confirmMockPayment(reference: string, tenantId: string) {
    if (process.env.NODE_ENV === 'production' && this.paystack.isConfigured) {
      throw new BadRequestException('Mock payments disabled in production');
    }
    const tenant = await this.tenantService.findById(tenantId);
    const amountGhs = tenant.subscription
      ? SUBSCRIPTION_PLAN_PRICES_GHS[tenant.subscription.plan]
      : 0;
    return this.tenantService.recordSubscriptionPayment(
      tenantId,
      reference,
      amountGhs || SUBSCRIPTION_PLAN_PRICES_GHS.growth,
    );
  }
}
