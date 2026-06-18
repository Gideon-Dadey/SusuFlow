/**
 * Shared k6 configuration for SusuFlow load tests.
 * @see docs/15-load-testing.md
 */
import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
export const TENANT_SLUG = __ENV.TENANT_SLUG || 'abc-susu';
export const LOAD_TEST_EMAIL = __ENV.LOAD_TEST_EMAIL || 'nana@abcsusu.com';
export const LOAD_TEST_PASSWORD = __ENV.LOAD_TEST_PASSWORD || 'Collector123!@#';
export const CUSTOMER_ID = __ENV.CUSTOMER_ID || '';

export const API_PREFIX = `${BASE_URL}/api/v1`;

export const defaultThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<200'],
};

export const smokeThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<500'],
};

export function tenantHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'x-tenant-slug': TENANT_SLUG,
    ...extra,
  };
}

export function authHeaders(token, extra = {}) {
  return tenantHeaders({
    Authorization: `Bearer ${token}`,
    ...extra,
  });
}

export function parseData(response) {
  try {
    const body = response.json();
    return body.data !== undefined ? body.data : body;
  } catch {
    return null;
  }
}

export function login() {
  const response = http.post(
    `${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: LOAD_TEST_EMAIL,
      password: LOAD_TEST_PASSWORD,
    }),
    { headers: tenantHeaders(), tags: { name: 'auth_login' } },
  );

  check(response, {
    'login status 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  const data = parseData(response);
  return data?.accessToken || null;
}
