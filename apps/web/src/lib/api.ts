import { getTenantSlug } from './utils';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  tenantSlug?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, tenantSlug, headers: customHeaders, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const slug =
    options.tenantSlug !== undefined ? options.tenantSlug : getTenantSlug();
  if (slug) headers['x-tenant-slug'] = slug;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  } catch {
    throw new ApiError(
      'Unable to reach the server. Start the API with: pnpm dev:api',
      0,
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail || error.title;
    if (response.status >= 500 && !detail) {
      const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      throw new ApiError(
        isLocal
          ? 'Server error. Make sure the API is running on port 4000 (pnpm dev:api).'
          : 'Server error. The API may be down or API_URL is not set on Render.',
        response.status,
        error.errors,
      );
    }
    throw new ApiError(
      detail || 'Request failed',
      response.status,
      error.errors,
    );
  }

  const json = await response.json();
  return json.data ?? json;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  primaryColor?: string;
  logoUrl?: string;
  status: string;
}

export interface DepositInitResponse {
  transactionId: string;
  reference: string;
  status: string;
  payment: {
    id: string;
    gateway: string;
    paymentUrl?: string;
    expiresAt: string;
  };
}

export const authApi = {
  login: (email: string, password: string, tenantSlug = '') =>
    api.post<LoginResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true, tenantSlug },
    ),

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post('/auth/register', data, { skipAuth: true }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

export const tenantApi = {
  getBySlug: (slug: string) =>
    api.get<TenantInfo>(`/tenants/${slug}`, { skipAuth: true, tenantSlug: slug }),
};

export interface AdminTenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
    trialEnd?: string | null;
    currentPeriodEnd?: string;
  } | null;
  _count?: { users: number; customers: number };
}

export interface CreateTenantPayload {
  slug: string;
  name: string;
  email: string;
  phone?: string;
  plan?: 'starter' | 'growth' | 'enterprise';
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
}

export interface CreateTenantResult {
  tenant: {
    id: string;
    slug: string;
    name: string;
    email: string;
    status: string;
    plan: string;
    trialEnd?: string;
  };
  admin: { id: string; email: string; firstName: string; lastName: string };
  credentials: {
    tenantSlug: string;
    email: string;
    temporaryPassword?: string;
    loginUrl: string;
  };
  message: string;
}

export interface BillingCheckoutResult {
  tenantId: string;
  plan: string;
  mode: 'paystack' | 'mock';
  reference: string;
  authorizationUrl: string;
  amountGhs: number;
  message?: string;
}

export const adminApi = {
  listTenants: () =>
    api.get<{ items: AdminTenant[]; hasMore: boolean; cursor?: string }>(
      '/admin/tenants',
      { tenantSlug: '' },
    ),

  createTenant: (data: CreateTenantPayload) =>
    api.post<CreateTenantResult>('/admin/tenants', data, { tenantSlug: '' }),

  activateTenant: (id: string) =>
    api.post<{ message: string }>(`/admin/tenants/${id}/activate`, {}, { tenantSlug: '' }),

  suspendTenant: (id: string, reason?: string) =>
    api.post<{ message: string }>(
      `/admin/tenants/${id}/suspend`,
      { reason },
      { tenantSlug: '' },
    ),

  createBillingCheckout: (id: string) =>
    api.post<BillingCheckoutResult>(
      `/admin/tenants/${id}/billing/checkout`,
      {},
      { tenantSlug: '' },
    ),

  confirmMockPayment: (reference: string, tenantId: string) =>
    api.post<{ message: string }>(
      '/webhooks/billing/mock/confirm',
      { reference, tenantId },
      { skipAuth: true, tenantSlug: '' },
    ),
};

export const depositApi = {
  initiate: (data: {
    amount: number;
    paymentMethod: string;
    customerId: string;
    payerPhone: string;
    idempotencyKey?: string;
  }) => api.post<DepositInitResponse>('/deposits', data),

  list: (params?: { status?: string; customer_id?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/deposits${query ? `?${query}` : ''}`,
    );
  },

  get: (id: string) => api.get<Transaction>(`/deposits/${id}`),
};

export const customerApi = {
  list: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ items: Customer[]; hasMore: boolean }>(
      `/customers${query ? `?${query}` : ''}`,
    );
  },

  get: (id: string) => api.get<Customer>(`/customers/${id}`),

  create: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    ghanaCardNumber?: string;
  }) => api.post<Customer>('/customers', data),

  getWallet: (id: string) =>
    api.get<{ walletId: string; balance: number; currency: string }>(`/customers/${id}/wallet`),
};

export const withdrawalApi = {
  create: (data: {
    customerId: string;
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>('/withdrawals', data),

  list: (params?: { customer_id?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/withdrawals${query ? `?${query}` : ''}`,
    );
  },
};

export interface Transaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string | number;
  currency: string;
  createdAt: string;
  completedAt?: string;
  customer?: {
    user?: { firstName: string; lastName: string };
  };
  payment?: {
    paymentMethod: string;
    status: string;
  };
  withdrawal?: {
    disbursementMethod: string;
    disbursementPhone: string;
    status: string;
  };
}

export interface Customer {
  id: string;
  customerNumber: string;
  status: string;
  kycLevel: number;
  ghanaCardNumber?: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  collector?: { firstName: string; lastName: string };
}
