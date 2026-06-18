/**
 * Stress test — find breaking point (manual / staging only).
 * Run: k6 run tests/load/stress.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  API_PREFIX,
  authHeaders,
  login,
} from './lib/config.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
  },
};

export function setup() {
  const token = login();
  if (!token) {
    throw new Error('Setup failed: could not obtain access token');
  }
  return { token };
}

export default function (data) {
  const roll = Math.random();

  if (roll < 0.4) {
    const res = http.get(`${API_PREFIX}/health/live`, { tags: { name: 'health' } });
    check(res, { ok: (r) => r.status === 200 });
  } else if (roll < 0.7) {
    const res = http.get(`${API_PREFIX}/customers?limit=10`, {
      headers: authHeaders(data.token),
      tags: { name: 'customers' },
    });
    check(res, { ok: (r) => r.status === 200 });
  } else {
    const res = http.get(`${API_PREFIX}/deposits?limit=10`, {
      headers: authHeaders(data.token),
      tags: { name: 'deposits' },
    });
    check(res, { ok: (r) => r.status === 200 });
  }

  sleep(0.2);
}
