/**
 * API baseline load test — validates PRD targets (p95 < 200ms, error rate < 0.1%).
 * Run: k6 run tests/load/api-baseline.js
 *
 * Requires API with THROTTLE_LIMIT raised (e.g. 10000) and seeded demo tenant.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  API_PREFIX,
  CUSTOMER_ID,
  defaultThresholds,
  tenantHeaders,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  scenarios: {
    health: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      exec: 'healthScenario',
      tags: { scenario: 'health' },
    },
    dashboard: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      exec: 'dashboardScenario',
      tags: { scenario: 'dashboard' },
    },
    deposits: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      exec: 'depositListScenario',
      tags: { scenario: 'deposits' },
    },
  },
  thresholds: {
    ...defaultThresholds,
    'http_req_duration{scenario:health}': ['p(95)<100'],
    'http_req_duration{scenario:dashboard}': ['p(95)<200'],
    'http_req_duration{scenario:deposits}': ['p(95)<250'],
  },
};

export function setup() {
  const token = login();
  if (!token) {
    throw new Error('Setup failed: could not obtain access token');
  }
  return { token, customerId: CUSTOMER_ID };
}

export function healthScenario() {
  const res = http.get(`${API_PREFIX}/health/live`, {
    tags: { name: 'health_live' },
  });
  check(res, { 'health live 200': (r) => r.status === 200 });
}

export function dashboardScenario(data) {
  const headers = authHeaders(data.token);

  const customersRes = http.get(`${API_PREFIX}/customers?limit=20`, {
    headers,
    tags: { name: 'customers_list' },
  });
  check(customersRes, { 'customers 200': (r) => r.status === 200 });

  const depositsRes = http.get(`${API_PREFIX}/deposits?limit=20`, {
    headers,
    tags: { name: 'deposits_list' },
  });
  check(depositsRes, { 'deposits 200': (r) => r.status === 200 });

  sleep(0.3);
}

export function depositListScenario(data) {
  http.get(`${API_PREFIX}/deposits?status=pending&limit=10`, {
    headers: authHeaders(data.token),
    tags: { name: 'deposits_pending' },
  });
  sleep(0.5);
}

export function depositInitScenario(data) {
  if (!data.customerId) {
    return;
  }

  const payload = JSON.stringify({
    amount: 10,
    paymentMethod: 'mtn_momo',
    customerId: data.customerId,
    payerPhone: '+233241234567',
    idempotencyKey: `load-${__VU}-${__ITER}-${Date.now()}`,
  });

  const res = http.post(`${API_PREFIX}/deposits`, payload, {
    headers: authHeaders(data.token),
    tags: { name: 'deposit_initiate' },
  });

  check(res, {
    'deposit accepted': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
