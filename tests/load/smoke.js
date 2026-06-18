/**
 * Smoke load test — fast sanity check for CI and post-deploy verification.
 * Run: k6 run tests/load/smoke.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  API_PREFIX,
  smokeThresholds,
  tenantHeaders,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: smokeThresholds,
};

export function setup() {
  const token = login();
  if (!token) {
    throw new Error('Setup failed: could not obtain access token');
  }
  return { token };
}

export default function (data) {
  const healthRes = http.get(`${API_PREFIX}/health`, {
    tags: { name: 'health' },
  });
  check(healthRes, {
    'health is 200': (r) => r.status === 200,
  });

  const customersRes = http.get(`${API_PREFIX}/customers?limit=10`, {
    headers: authHeaders(data.token),
    tags: { name: 'customers_list' },
  });
  check(customersRes, {
    'customers is 200': (r) => r.status === 200,
  });

  const depositsRes = http.get(`${API_PREFIX}/deposits?limit=10`, {
    headers: authHeaders(data.token),
    tags: { name: 'deposits_list' },
  });
  check(depositsRes, {
    'deposits is 200': (r) => r.status === 200,
  });

  sleep(1);
}
