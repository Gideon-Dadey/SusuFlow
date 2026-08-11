import { getTenantSlug } from "./utils";

const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  tenantSlug?: string;
}

function isLocalBrowser() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Next.js rewrite fails with an empty 5xx while Nest is restarting. */
function isTransientProxyFailure(response: Response, body: unknown) {
  if (
    response.status === 502 ||
    response.status === 503 ||
    response.status === 504
  ) {
    return true;
  }
  if (response.status < 500) return false;
  if (!body || typeof body !== "object") return true;
  const record = body as Record<string, unknown>;
  return !record.detail && !record.title && !record.message;
}

async function fetchWithApiRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    const first = await fetch(url, init);
    if (!isTransientProxyFailure(first, null) || first.status < 500) {
      return first;
    }
    const peek = await first
      .clone()
      .json()
      .catch(() => null);
    if (!isTransientProxyFailure(first, peek)) return first;
    await sleep(600);
    return fetch(url, init);
  } catch {
    await sleep(600);
    return fetch(url, init);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, tenantSlug, headers: customHeaders, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const slug =
    options.tenantSlug !== undefined ? options.tenantSlug : getTenantSlug();
  if (slug) headers["x-tenant-slug"] = slug;

  let response: Response;
  try {
    response = await fetchWithApiRetry(`${API_BASE}${endpoint}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Keep `pnpm run dev` running, wait a moment, and try again.",
      0,
    );
  }

  if (!response.ok) {
    if (response.status === 401 && !skipAuth && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken =
              refreshData.data?.accessToken || refreshData.accessToken;
            if (newAccessToken) {
              localStorage.setItem("access_token", newAccessToken);

              // Dynamically import store to avoid circular dependency
              const { useAuthStore } = await import("@/stores/auth.store");
              useAuthStore.setState({
                accessToken: newAccessToken,
                isAuthenticated: true,
              });

              // Retry the request with the new access token
              headers.Authorization = `Bearer ${newAccessToken}`;
              response = await fetch(`${API_BASE}${endpoint}`, {
                ...init,
                headers,
              });

              if (response.ok) {
                const json = await response.json();
                return json.data ?? json;
              }
            }
          }
        } catch {
          // Ignore and fall through to logout
        }
      }

      // If refresh fails or retried request still fails, clear tokens and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      const { useAuthStore } = await import("@/stores/auth.store");
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      window.location.href = "/login?expired=1";
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    const error = await response.json().catch(() => ({}));
    const detail =
      (typeof error.detail === "string" && error.detail) ||
      (typeof error.message === "string" && error.message) ||
      (typeof error.title === "string" && error.title) ||
      "";
    if (response.status >= 500 && !detail) {
      throw new ApiError(
        isLocalBrowser()
          ? "The API was restarting. Wait a second and create the customer again."
          : "Server error. The API may be down or API_URL is not set on Render.",
        response.status,
        error.errors,
      );
    }
    throw new ApiError(
      detail || "Request failed",
      response.status,
      error.errors,
    );
  }

  const json = await response.json();
  return json.data ?? json;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

function toQueryString(params?: Record<string, any>): string {
  if (!params) return "";
  const cleanParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = String(value);
    }
  }
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : "";
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  mfaRequired?: boolean;
  mfaToken?: string;
  userId?: string;
  email?: string;
  message?: string;
  user?: {
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
  logoUrl?: string | null;
  status: string;
}

export interface User {
  id: string;
  tenantId: string | null;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  status: string;
  emailVerified: boolean;
  mfaEnabled?: boolean;
  createdAt: string;
  customer?: Customer;
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
  login: (email: string, password: string, tenantSlug = "") =>
    api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      { skipAuth: true, tenantSlug },
    ),

  mfaSetup: () =>
    api.post<{ message: string; expiresIn: number }>("/auth/mfa/setup"),

  mfaEnable: (code: string) =>
    api.post<{ message: string; mfaEnabled: boolean }>("/auth/mfa/enable", {
      code,
    }),

  mfaDisable: (password: string, code: string) =>
    api.post<{ message: string; mfaEnabled: boolean }>("/auth/mfa/disable", {
      password,
      code,
    }),

  mfaVerifyLogin: (
    mfaToken: string,
    userId: string,
    code: string,
    tenantSlug = "",
  ) =>
    api.post<LoginResponse>(
      "/auth/mfa/verify-login",
      { mfaToken, userId, code },
      { skipAuth: true, tenantSlug },
    ),

  register: (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
    },
    tenantSlug = "",
  ) =>
    api.post<{ userId: string; customerId: string; message: string }>(
      "/auth/register",
      data,
      { skipAuth: true, tenantSlug },
    ),

  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; expiresIn: number }>(
      "/auth/refresh",
      { refreshToken },
      { skipAuth: true },
    ),

  sendOtp: (userId: string, channel: "email" | "phone", tenantSlug: string) =>
    api.post<{ message: string; channel: string; expiresIn: number }>(
      "/auth/verify/send",
      { userId, channel },
      { skipAuth: true, tenantSlug },
    ),

  verifyOtp: (
    userId: string,
    channel: "email" | "phone",
    code: string,
    tenantSlug: string,
  ) =>
    api.post<{
      message: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      accountActive: boolean;
    }>(
      "/auth/verify/confirm",
      { userId, channel, code },
      { skipAuth: true, tenantSlug },
    ),

  verificationStatus: (userId: string, tenantSlug: string) =>
    api.get<{
      id: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      status: string;
    }>(`/auth/verify/status/${userId}`, { skipAuth: true, tenantSlug }),
};

export const tenantApi = {
  getBySlug: (slug: string) =>
    api.get<TenantInfo>(`/tenants/${slug}`, {
      skipAuth: true,
      tenantSlug: slug,
    }),
  seedDemo: (slug: string) =>
    api.post<{ message: string }>(
      `/tenants/${slug}/seed-demo`,
      {},
      { skipAuth: true, tenantSlug: slug },
    ),
  getMe: () =>
    api.get<
      TenantInfo & {
        phone?: string;
        email?: string;
        settings?: Record<string, any>;
      }
    >("/tenants/me"),
  updateMe: (
    data: Partial<
      TenantInfo & {
        phone?: string;
        email?: string;
        settings?: Record<string, any>;
      }
    >,
  ) => api.put<TenantInfo>("/tenants/me", data),
};

export const userApi = {
  getMe: () => api.get<User>("/users/me"),
  updateMe: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string | null;
  }) => api.put<User>("/users/me", data),
  updatePassword: (data: { currentPassword?: string; newPassword?: string }) =>
    api.put<{ message: string }>("/users/me/password", data),
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
  plan?: "starter" | "growth" | "enterprise";
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
  mode: "paystack" | "mock";
  reference: string;
  authorizationUrl: string;
  amountGhs: number;
  message?: string;
}

export const adminApi = {
  listTenants: () =>
    api.get<{ items: AdminTenant[]; hasMore: boolean; cursor?: string }>(
      "/admin/tenants",
      { tenantSlug: "" },
    ),

  createTenant: (data: CreateTenantPayload) =>
    api.post<CreateTenantResult>("/admin/tenants", data, { tenantSlug: "" }),

  activateTenant: (id: string) =>
    api.post<{ message: string }>(
      `/admin/tenants/${id}/activate`,
      {},
      { tenantSlug: "" },
    ),

  suspendTenant: (id: string, reason?: string) =>
    api.post<{ message: string }>(
      `/admin/tenants/${id}/suspend`,
      { reason },
      { tenantSlug: "" },
    ),

  createBillingCheckout: (id: string) =>
    api.post<BillingCheckoutResult>(
      `/admin/tenants/${id}/billing/checkout`,
      {},
      { tenantSlug: "" },
    ),

  confirmMockPayment: (reference: string, tenantId: string) =>
    api.post<{ message: string }>(
      "/webhooks/billing/mock/confirm",
      { reference, tenantId },
      { skipAuth: true, tenantSlug: "" },
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
    }>("/admin/dashboard/summary", { tenantSlug: "" }),

  listDeposits: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/admin/deposits${query}`,
      { tenantSlug: "" },
    );
  },

  listWithdrawals: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/admin/withdrawals${query}`,
      { tenantSlug: "" },
    );
  },

  listFraud: (params?: { tenant_id?: string; status?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: FraudAlert[]; hasMore: boolean }>(
      `/admin/fraud${query}`,
      { tenantSlug: "" },
    );
  },

  listAuditLogs: (params?: { tenant_id?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: AuditLogEntry[]; hasMore: boolean }>(
      `/admin/audit${query}`,
      { tenantSlug: "" },
    );
  },

  getHealth: () => api.get<any>("/admin/health", { tenantSlug: "" }),

  getBilling: () => api.get<any>("/admin/billing", { tenantSlug: "" }),

  getLedger: () => api.get<any>("/admin/ledger", { tenantSlug: "" }),

  getCommissions: () => api.get<any>("/admin/commissions", { tenantSlug: "" }),

  getPlans: () => api.get<any>("/admin/plans", { tenantSlug: "" }),

  getCustomers: (params?: { search?: string }) => {
    const query = toQueryString(params);
    return api.get<{ items: Customer[] }>(`/admin/customers${query}`, {
      tenantSlug: "",
    });
  },

  getUsers: () =>
    api.get<{ items: User[] }>("/admin/users", { tenantSlug: "" }),

  getKycQueue: () =>
    api.get<{ items: KycDocument[] }>("/admin/kyc", { tenantSlug: "" }),

  getSettings: () => api.get<any>("/admin/settings", { tenantSlug: "" }),

  updateSettings: (data: any) =>
    api.put<any>("/admin/settings", data, { tenantSlug: "" }),

  clearCache: () =>
    api.post<any>("/admin/dev-ops/clear-cache", {}, { tenantSlug: "" }),
};

export const depositApi = {
  initiate: (data: {
    amount: number;
    paymentMethod: string;
    customerId: string;
    payerPhone: string;
    idempotencyKey?: string;
  }) => api.post<DepositInitResponse>("/deposits", data),

  list: (params?: { status?: string; customer_id?: string }) => {
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/deposits${toQueryString(params)}`,
    );
  },

  get: (id: string) => api.get<Transaction>(`/deposits/${id}`),

  confirm: (id: string) =>
    api.post<{ message: string }>(`/deposits/${id}/confirm`, {}),
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
    dateOfBirth?: string;
    address?: string;
  }) => api.post<Customer>("/customers", data),

  getWallet: (id: string) =>
    api.get<{ walletId: string; balance: number; currency: string }>(
      `/customers/${id}/wallet`,
    ),

  activate: (id: string) => api.post<Customer>(`/customers/${id}/activate`, {}),
};

export const withdrawalApi = {
  create: (data: {
    customerId: string;
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>("/withdrawals", data),

  list: (params?: { customer_id?: string }) => {
    return api.get<{ items: Transaction[]; hasMore: boolean }>(
      `/withdrawals${toQueryString(params)}`,
    );
  },

  requestWithdrawal: (data: {
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>("/withdrawals/request", data),

  approveWithdrawal: (id: string) =>
    api.post<{ message: string }>(`/withdrawals/${id}/approve`, {}),

  rejectWithdrawal: (id: string, reason: string) =>
    api.post<{ message: string }>(`/withdrawals/${id}/reject`, {
      rejectionReason: reason,
    }),
};

export interface SavingsPlan {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  minAmount: number;
  maxAmount?: number;
  durationMonths?: number;
  status?: "active" | "inactive";
  createdAt?: string;
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
  listPlans: () => api.get<SavingsPlan[]>("/plans"),

  enroll: (data: { planId: string; targetAmount?: number }) =>
    api.post<CustomerPlan>("/plans/enroll", data),

  listEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>("/plans/my-enrollments"),
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
  description?: string;
  customer?: {
    customerNumber?: string;
    user?: {
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
    };
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
  kycStatus?: string;
  ghanaCardNumber?: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string | null;
  };
  collector?: { firstName: string; lastName: string };
}

export interface KycDocument {
  id: string;
  customerId: string;
  documentType: "ghana_card" | "passport" | "utility_bill" | "selfie";
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
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
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "false_positive";
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
  accountType: "asset" | "liability" | "revenue" | "expense" | "equity";
  status: string;
  debitSum: number;
  creditSum: number;
  balance: number;
}

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  role?: string;
  roleLabel: string;
}

export interface AuditLogSubject {
  id?: string | null;
  name: string;
  secondary?: string;
}

export interface AuditLogMoney {
  amount: number | null;
  reference?: string;
  currency: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  createdAt: string;
  category?: "money" | "customers" | "identity" | "access" | "risk";
  user?: { firstName: string; lastName: string; email: string } | null;
  actor?: AuditLogActor | null;
  subject?: AuditLogSubject | null;
  money?: AuditLogMoney | null;
  tenant?: { name: string; slug: string } | null;
}

export interface AuditLogSummary {
  all: number;
  money: number;
  customers: number;
  identity: number;
  access: number;
  risk: number;
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

export interface KycStatusResponse {
  customerId: string;
  kycLevel: number;
  kycStatus: "pending" | "verified" | "rejected";
  ghanaCardNumber?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  documents: KycDocument[];
}

export const kycApi = {
  getMyStatus: () => api.get<KycStatusResponse>("/kyc/my-status"),
  submit: (data: {
    documentType:
      | "ghana_card"
      | "passport"
      | "voter_id"
      | "nhis"
      | "utility_bill"
      | "selfie";
    idNumber: string;
    dateOfBirth?: string;
    address?: string;
    fileUrl: string;
  }) => api.post<KycDocument>("/kyc/submit", data),
  list: (status?: string) =>
    api.get<KycDocument[]>(`/kyc${status ? `?status=${status}` : ""}`),
  review: (
    id: string,
    status: "approved" | "rejected",
    rejectionReason?: string,
  ) => api.post<KycDocument>(`/kyc/${id}/review`, { status, rejectionReason }),
  reviewBundle: (
    customerId: string,
    status: "approved" | "rejected",
    rejectionReason?: string,
  ) =>
    api.post<{
      customerId: string;
      kycStatus: string;
      reviewed: number;
      documents: Array<{ id: string; status: string; documentType: string }>;
    }>("/kyc/review-bundle", { customerId, status, rejectionReason }),
};

export const fraudApi = {
  list: (status?: string) =>
    api.get<FraudAlert[]>(`/fraud${status ? `?status=${status}` : ""}`),
  resolve: (
    id: string,
    status: "resolved" | "false_positive",
    resolutionNotes?: string,
  ) =>
    api.post<FraudAlert>(`/fraud/${id}/resolve`, { status, resolutionNotes }),
};

export const ledgerApi = {
  listAccounts: () => api.get<LedgerAccount[]>("/ledger/accounts"),
  listCommissions: () => api.get<any[]>("/ledger/commissions"),
  payoutCommission: (data: {
    collectorId: string;
    amount: number;
    description?: string;
  }) => api.post<any>("/ledger/commissions/payout", data),
};

export const auditApi = {
  list: (params?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    category?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }) => {
    return api.get<{
      items: AuditLogEntry[];
      hasMore: boolean;
      cursor?: string;
      summary?: AuditLogSummary;
    }>(`/audit${toQueryString(params)}`);
  },
};

export const reportApi = {
  getSummary: () => api.get<OperationsReport>("/reports/summary"),
};

export type QueueItemType =
  | "withdrawal"
  | "deposit"
  | "kyc"
  | "fraud"
  | "customer";

export interface ActionQueueItem {
  id: string;
  type: QueueItemType;
  title: string;
  subtitle: string;
  amount?: number;
  status: string;
  createdAt: string;
  priority: "high" | "medium" | "low";
}

export interface ActionQueueSummary {
  pendingWithdrawals: number;
  pendingDeposits: number;
  pendingKyc: number;
  openFraud: number;
  pendingCustomers: number;
  total: number;
}

export interface CollectorPerformance {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  customerCount: number;
  depositsCount: number;
  depositsVolume: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionBalance: number;
}

export interface TeamMember {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: string[];
  customerCount: number;
}

export const operationsApi = {
  getQueue: () =>
    api.get<{ summary: ActionQueueSummary; items: ActionQueueItem[] }>(
      "/operations/queue",
    ),
  getCollectors: () =>
    api.get<{ items: CollectorPerformance[] }>("/operations/collectors"),
  getMySummary: () =>
    api.get<{
      collector: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        status: string;
      };
      customerCount: number;
      depositsCount: number;
      depositsVolume: number;
      todayDepositsCount: number;
      todayDepositsVolume: number;
      weekDepositsCount: number;
      weekDepositsVolume: number;
      commissionEarned: number;
      commissionPaid: number;
      commissionBalance: number;
      pendingDeposits: number;
    }>("/operations/me/summary"),
  getMyActivity: () =>
    api.get<{ items: AuditLogEntry[]; hasMore: boolean; cursor?: string }>(
      "/operations/me/activity",
    ),
};

export const teamApi = {
  list: () => api.get<{ items: TeamMember[] }>("/team"),
  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: "account_officer" | "collector" | "auditor";
    password?: string;
  }) =>
    api.post<{
      user: TeamMember;
      credentials?: { email: string; temporaryPassword: string };
      message: string;
    }>("/team", data),
  update: (
    id: string,
    data: Partial<{
      status: "active" | "suspended" | "pending";
      firstName: string;
      lastName: string;
      phone: string;
    }>,
  ) => api.patch<{ user: TeamMember; message: string }>(`/team/${id}`, data),
};

// Extend existing planApi to include staff plan management
const originalPlanApi = planApi;
export const staffPlanApi = {
  ...originalPlanApi,
  listAllPlans: () => api.get<SavingsPlan[]>("/plans?all=true"),
  createPlan: (data: {
    name: string;
    description?: string;
    frequency: SavingsPlan["frequency"];
    minAmount: number;
    maxAmount?: number;
    durationMonths?: number;
  }) => api.post<SavingsPlan>("/plans", data),
  updatePlan: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      frequency: SavingsPlan["frequency"];
      minAmount: number;
      maxAmount: number;
      durationMonths: number;
      status: "active" | "inactive";
    }>,
  ) => api.patch<SavingsPlan>(`/plans/${id}`, data),
  listAllEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>("/plans/enrollments"),
};
