import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('rejects protected deposit list without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/deposits')
        .set('x-tenant-slug', 'abc-susu')
        .expect(401);
    });

    it('rejects protected customer list without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/customers')
        .set('x-tenant-slug', 'abc-susu')
        .expect(401);
    });

    it('rejects deposit initiation without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/deposits')
        .set('x-tenant-slug', 'abc-susu')
        .send({
          amount: 100,
          paymentMethod: 'mtn_momo',
          customerId: '00000000-0000-0000-0000-000000000001',
          payerPhone: '+233241234567',
        })
        .expect(401);
    });

    it('rejects admin tenant list without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/admin/tenants')
        .expect(401);
    });
  });

  describe('Public endpoints', () => {
    it('allows health check without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/health').expect(200);
    });

    it('allows login endpoint without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('x-tenant-slug', 'abc-susu')
        .send({ email: 'invalid', password: 'short' })
        .expect((res) => {
          // 400 validation or 401 credentials — not 401 missing token from guard on public route
          expect([400, 401, 422]).toContain(res.status);
        });
    });

    it('allows hubtel webhook without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/webhooks/hubtel')
        .send({
          Data: {
            ClientReference: 'TXN-TEST',
            Status: 'Failed',
            Amount: 0,
          },
        })
        .expect(200);
    });
  });

  describe('Input validation', () => {
    it('rejects malformed login payload', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('rejects register with weak password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('x-tenant-slug', 'abc-susu')
        .send({
          firstName: 'Kwame',
          lastName: 'Mensah',
          email: 'kwame@example.com',
          phone: '+233241234567',
          password: 'weak',
        })
        .expect(400);
    });
  });
});
