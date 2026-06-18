import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns healthy status', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('healthy');
        expect(res.body.data.checks.database).toBe('healthy');
        expect(res.body.data.checks.redis).toBe('healthy');
      });
  });

  it('GET /api/v1/health/live returns ok', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('ok');
      });
  });
});
