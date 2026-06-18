/**
 * Deposit initiation load test (optional — requires CUSTOMER_ID env var).
 * Run: CUSTOMER_ID=<uuid> k6 run tests/load/deposit-init.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  API_PREFIX,
  CUSTOMER_ID,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  if (!CUSTOMER_ID) {
    console.warn('CUSTOMER_ID not set — skipping deposit initiation load test');
    return { token: null, customerId: null };
  }

  const token = login();
  return { token, customerId: CUSTOMER_ID };
}

export default function (data) {
  if (!data.token || !data.customerId) {
    return;
  }

  const res = http.post(
    `${API_PREFIX}/deposits`,
    JSON.stringify({
      amount: 10,
      paymentMethod: 'mtn_momo',
      customerId: data.customerId,
      payerPhone: '+233241234567',
      idempotencyKey: `load-${__VU}-${__ITER}-${Date.now()}`,
    }),
    {
      headers: authHeaders(data.token),
      tags: { name: 'deposit_initiate' },
    },
  );

  check(res, {
    'deposit created': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
