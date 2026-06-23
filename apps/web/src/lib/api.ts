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

function toQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const cleanParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = String(value);
    }
  }
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : '';
}

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
    tenantSlug?: string;
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

export interface User {
  id: string;
  tenantId: string | null;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
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
  seedDemo: (slug: string) =>
    api.post<{ message: string }>(`/tenants/${slug}/seed-demo`, {}, { skipAuth: true, tenantSlug: slug }),
  getMe: () =>
    api.get<TenantInfo & { phone?: string; email?: string; settings?: Record<string, any> }>('/tenants/me'),
  updateMe: (data: Partial<TenantInfo & { phone?: string; email?: string; settings?: Record<string, any> }>) =>
    api.put<TenantInfo>('/tenants/me', data),
};

export const userApi = {
  getMe: () =>
    api.get<User>('/users/me'),
  updateMe: (data: { firstName?: string; lastName?: string; phone?: string; email?: string }) =>
    api.put<User>('/users/me', data),
  updatePassword: (data: { currentPassword?: string; newPassword?: string }) =>
    api.put<{ message: string }>('/users/me/password', data),
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

  getGlobalSummary: () =>
    api.get<{
      totalTenants: number;
      activeTenants: number;
      totalDeposits: number;
      totalWithdrawals: number;
      openFraudAlerts: number;
      recentTransactions: any[];
      recentAuditLogs: any[];
    }>('/admin/dashboard/summary', { tenantSlug: '' }),

  listDeposits: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/admin/deposits${query}`,
      { tenantSlug: '' },
    );
  },

  listWithdrawals: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/admin/withdrawals${query}`,
      { tenantSlug: '' },
    );
  },

  listFraud: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: FraudAlert[]; hasMore: boolean }>(
      `/admin/fraud${query}`,
      { tenantSlug: '' },
    );
  },

  listAuditLogs: (params?: { tenant_id?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: AuditLogEntry[]; hasMore: boolean }>(
      `/admin/audit${query}`,
      { tenantSlug: '' },
    );
  },

  getHealth: () =>
    api.get<any>('/admin/health', { tenantSlug: '' }),

  getBilling: () =>
    api.get<any>('/admin/billing', { tenantSlug: '' }),

  getLedger: () =>
    api.get<any>('/admin/ledger', { tenantSlug: '' }),

  getCommissions: () =>
    api.get<any>('/admin/commissions', { tenantSlug: '' }),

  getPlans: () =>
    api.get<any>('/admin/plans', { tenantSlug: '' }),

  getCustomers: (params?: { search?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Customer[] }>(`/admin/customers${query}`, { tenantSlug: '' });
  },

  getUsers: () =>
    api.get<{ items: User[] }>('/admin/users', { tenantSlug: '' }),

  getKycQueue: () =>
    api.get<{ items: KycDocument[] }>('/admin/kyc', { tenantSlug: '' }),

  getSettings: () =>
    api.get<any>('/admin/settings', { tenantSlug: '' }),

  updateSettings: (data: any) =>
    api.put<any>('/admin/settings', data, { tenantSlug: '' }),

  clearCache: () =>
    api.post<any>('/admin/dev-ops/clear-cache', {}, { tenantSlug: '' }),
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
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/deposits${toQueryString(params)}`,
    );
  },

  get: (id: string) => api.get<Transaction>(`/deposits/${id}`),

  confirm: (id: string) => api.post<{ message: string }>(`/deposits/${id}/confirm`, {}),
};

export const customerApi = {
  list: (params?: { search?: string; status?: string }) => {
    return api.get<{ items: Customer[]; hasMore: boolean }>(
      `/customers${toQueryString(params)}`,
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

  activate: (id: string) => api.post<Customer>(`/customers/${id}/activate`, {}),
};

export const withdrawalApi = {
  create: (data: {
    customerId: string;
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>('/withdrawals', data),

  list: (params?: { customer_id?: string }) => {
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/withdrawals${toQueryString(params)}`,
    );
  },

  requestWithdrawal: (data: {
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>('/withdrawals/request', data),

  approveWithdrawal: (id: string) =>
    api.post<{ message: string }>(`/withdrawals/${id}/approve`, {}),

  rejectWithdrawal: (id: string, reason: string) =>
    api.post<{ message: string }>(`/withdrawals/${id}/reject`, { rejectionReason: reason }),
};

export interface SavingsPlan {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  minAmount: number;
  maxAmount?: number;
  durationMonths?: number;
}

export interface CustomerPlan {
  id: string;
  customerId: string;
  planId: string;
  targetAmount: number | string;
  status: string;
  startedAt: string;
  endsAt?: string;
  plan: SavingsPlan;
  customer?: Customer;
}

export interface CustomerPlanWithProgress extends CustomerPlan {
  savedAmount: number;
  progressPercent: number;
}

export const planApi = {
  listPlans: () => api.get<SavingsPlan[]>('/plans'),
  
  enroll: (data: { planId: string; targetAmount?: number }) =>
    api.post<CustomerPlan>('/plans/enroll', data),
    
  listEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>('/plans/my-enrollments'),
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
    customerNumber?: string;
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
  tenant?: { name: string; slug: string } | null;
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

export interface KycDocument {
  id: string;
  customerId: string;
  documentType: 'ghana_card' | 'passport' | 'utility_bill' | 'selfie';
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedById?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  customer?: Customer;
  reviewedBy?: { firstName: string; lastName: string };
}

export interface FraudAlert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resourceType?: string;
  resourceId?: string;
  details: Record<string, any>;
  resolvedById?: string;
  resolvedAt?: string;
  createdAt: string;
  resolvedBy?: { firstName: string; lastName: string };
  tenant?: { name: string; slug: string } | null;
}

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  accountType: 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';
  status: string;
  debitSum: number;
  creditSum: number;
  balance: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  tenant?: { name: string; slug: string } | null;
}

export interface OperationsReport {
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    outstandingLiability: number;
    collectorCommissionsPayable: number;
    totalCommissionExpense: number;
    platformCash: number;
    netOperationsBalance: number;
  };
  dailyTrends: { date: string; deposits: number; withdrawals: number }[];
}

export const kycApi = {
  list: (status?: string) =>
    api.get<KycDocument[]>(`/kyc${status ? `?status=${status}` : ''}`),
  review: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
    api.post<KycDocument>(`/kyc/${id}/review`, { status, rejectionReason }),
};

export const fraudApi = {
  list: (status?: string) =>
    api.get<FraudAlert[]>(`/fraud${status ? `?status=${status}` : ''}`),
  resolve: (id: string, status: 'resolved' | 'false_positive', resolutionNotes?: string) =>
    api.post<FraudAlert>(`/fraud/${id}/resolve`, { status, resolutionNotes }),
};

export const ledgerApi = {
  listAccounts: () => api.get<LedgerAccount[]>('/ledger/accounts'),
  listCommissions: () => api.get<any[]>('/ledger/commissions'),
  payoutCommission: (data: { collectorId: string; amount: number; description?: string }) =>
    api.post<any>('/ledger/commissions/payout', data),
};

export const auditApi = {
  list: (params?: { userId?: string; action?: string; resourceType?: string; cursor?: string; limit?: number }) => {
    return api.get<{ items: AuditLogEntry[]; hasMore: boolean; cursor?: string }>(
      `/audit${toQueryString(params)}`,
    );
  },
};

export const reportApi = {
  getSummary: () => api.get<OperationsReport>('/reports/summary'),
};

// Extend existing planApi to include listing all enrollments for staff
const originalPlanApi = planApi;
export const staffPlanApi = {
  ...originalPlanApi,
  listAllEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>('/plans/enrollments'),
};

