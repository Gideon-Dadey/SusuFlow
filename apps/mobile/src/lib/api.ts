import { storage } from "./storage";

const API_BASE = `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000"}/api/v1`;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  tenantSlug?: string;
}

async function getAccessToken(): Promise<string | null> {
  return storage.getItem(storage.keys.accessToken);
}

async function getTenantSlug(): Promise<string> {
  return (await storage.getItem(storage.keys.tenantSlug)) || "";
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

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const slug =
    options.tenantSlug !== undefined
      ? options.tenantSlug
      : await getTenantSlug();
  if (slug) headers["x-tenant-slug"] = slug;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Start the API with: pnpm dev:api",
      0,
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = error.detail || error.title || "Request failed";
    throw new ApiError(detail, response.status);
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
};

function toQueryString(params?: Record<string, string | undefined>): string {
  if (!params) return "";
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      clean[key] = String(value);
    }
  }
  const query = new URLSearchParams(clean).toString();
  return query ? `?${query}` : "";
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  phone?: string | null;
  customer?: Customer;
}

export interface Customer {
  id: string;
  customerNumber: string;
  status: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string | number;
  currency: string;
  createdAt: string;
  description?: string;
}

export interface SavingsPlan {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  minAmount: number;
  maxAmount?: number;
}

export interface CustomerPlanWithProgress {
  id: string;
  targetAmount: number | string;
  status: string;
  savedAmount: number;
  progressPercent: number;
  plan: SavingsPlan;
}

export const authApi = {
  login: (email: string, password: string, tenantSlug = "") =>
    api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      { skipAuth: true, tenantSlug },
    ),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
};

export const userApi = {
  getMe: () => api.get<User>("/users/me"),
  updateMe: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) => api.put<User>("/users/me", data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/users/me/password", data),
};

export const customerApi = {
  getWallet: (id: string) =>
    api.get<{ walletId: string; balance: number; currency: string }>(
      `/customers/${id}/wallet`,
    ),
};

export const depositApi = {
  initiate: (data: {
    amount: number;
    paymentMethod: string;
    customerId: string;
    payerPhone: string;
  }) =>
    api.post<{
      transactionId: string;
      reference: string;
      payment: { paymentUrl?: string };
    }>("/deposits", data),
  list: (params?: { customer_id?: string }) =>
    api.get<{ items: Transaction[] }>(`/deposits${toQueryString(params)}`),
};

export const withdrawalApi = {
  requestWithdrawal: (data: {
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>("/withdrawals/request", data),
  list: (params?: { customer_id?: string }) =>
    api.get<{ items: Transaction[] }>(`/withdrawals${toQueryString(params)}`),
};

export const planApi = {
  listPlans: () => api.get<SavingsPlan[]>("/plans"),
  enroll: (data: { planId: string; targetAmount?: number }) =>
    api.post("/plans/enroll", data),
  listEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>("/plans/my-enrollments"),
};
