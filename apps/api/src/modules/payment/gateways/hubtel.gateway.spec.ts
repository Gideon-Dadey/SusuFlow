import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { HubtelGateway } from './hubtel.gateway';

describe('HubtelGateway', () => {
  let gateway: HubtelGateway;
  let config: Record<string, string>;

  beforeEach(async () => {
    config = {
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
    };

    const module = await Test.createTestingModule({
      providers: [
        HubtelGateway,
        {
          provide: ConfigService,
          useValue: { get: (key: string, def?: string) => config[key] ?? def },
        },
      ],
    }).compile();

    gateway = module.get(HubtelGateway);
  });

  describe('initiatePayment', () => {
    it('returns mock session in development', async () => {
      const session = await gateway.initiatePayment({
        amount: 100,
        currency: 'GHS',
        reference: 'TXN-TEST-001',
        payerPhone: '+233241234567',
        paymentMethod: 'mtn_momo',
        callbackUrl: 'http://localhost/callback',
      });

      expect(session.sessionId).toContain('mock_TXN-TEST-001');
      expect(session.gatewayReference).toContain('HUB-MOCK');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('verifyWebhook', () => {
    it('parses successful Hubtel payload', async () => {
      const payload = {
        Data: {
          ClientReference: 'TXN-20260618-ABC',
          CheckoutId: 'hub-123',
          Status: 'Success',
          Amount: 100,
          CustomerPhoneNumber: '233241234567',
        },
      };

      const event = await gateway.verifyWebhook(payload, '');
      expect(event.reference).toBe('TXN-20260618-ABC');
      expect(event.status).toBe('success');
      expect(event.amount).toBe(100);
    });

    it('rejects invalid signature in production', async () => {
      config.NODE_ENV = 'production';
      config.HUBTEL_WEBHOOK_SECRET = 'test-secret';
      const payload = { Data: { Status: 'Success' } };

      await expect(gateway.verifyWebhook(payload, 'bad-signature')).rejects.toThrow(
        'Invalid webhook signature',
      );
    });

    it('accepts valid signature in production', async () => {
      config.NODE_ENV = 'production';
      config.HUBTEL_WEBHOOK_SECRET = 'test-secret';
      const payload = { Data: { Status: 'Success', ClientReference: 'REF-1', Amount: 50 } };
      const signature = createHmac('sha256', 'test-secret')
        .update(JSON.stringify(payload))
        .digest('hex');

      const event = await gateway.verifyWebhook(payload, signature);
      expect(event.status).toBe('success');
    });
  });

  describe('disburseFunds', () => {
    it('returns mock success in development', async () => {
      const result = await gateway.disburseFunds({
        amount: 50,
        phone: '+233241234567',
        reference: 'WD-001',
      });
      expect(result.success).toBe(true);
      expect(result.gatewayReference).toContain('DISB-MOCK');
    });
  });
});
