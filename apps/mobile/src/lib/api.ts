import { getApiBaseUrl } from "./config";
import { rememberedAccessToken, rememberedTenantSlug } from "./session-memory";
import { storage } from "./storage";

function getApiRoot(): string {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  tenantSlug?: string;
  _retry?: boolean;
}

let refreshInFlight: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;
let onTokenRefreshed: ((accessToken: string) => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export function setTokenRefreshedHandler(
  handler: (accessToken: string) => void,
) {
  onTokenRefreshed = handler;
}

export async function refreshSessionFromStorage(): Promise<boolean> {
  return tryRefreshSession();
}

async function getAccessToken(): Promise<string | null> {
  return (
    rememberedAccessToken() ?? (await storage.getItem(storage.keys.accessToken))
  );
}

async function getTenantSlug(): Promise<string> {
  const remembered = rememberedTenantSlug();
  if (remembered) return remembered;
  return (await storage.getItem(storage.keys.tenantSlug)) || "";
}

async function clearLocalSession() {
  await storage.removeItem(storage.keys.accessToken);
  await storage.removeItem(storage.keys.refreshToken);
  onSessionExpired?.();
}

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await storage.getItem(storage.keys.refreshToken);
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${getApiRoot()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const json = await response.json();
      const data = json.data ?? json;
      if (!data?.accessToken) return false;

      await storage.setItem(storage.keys.accessToken, data.accessToken);
      onTokenRefreshed?.(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    skipAuth,
    tenantSlug,
    headers: customHeaders,
    _retry,
    ...init
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  // localtunnel interstitial bypass for physical-device API access
  if (getApiBaseUrl().includes("loca.lt")) {
    headers["Bypass-Tunnel-Reminder"] = "true";
  }

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
    response = await fetch(`${getApiRoot()}${endpoint}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Unable to connect. Check your internet connection and try again.",
      0,
    );
  }

  if (response.status === 401 && !skipAuth && !_retry) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return request<T>(endpoint, { ...options, _retry: true });
    }
    await clearLocalSession();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const nested =
      typeof error.message === "object" && error.message !== null
        ? (error.message as Record<string, unknown>)
        : null;
    const detail =
      (nested?.message as string) ||
      error.detail ||
      (typeof error.message === "string" ? error.message : null) ||
      (Array.isArray(error.message)
        ? error.message
            .map((item: unknown) =>
              typeof item === "string"
                ? item
                : typeof item === "object" &&
                    item &&
                    "message" in item &&
                    typeof (item as { message: unknown }).message === "string"
                  ? (item as { message: string }).message
                  : null,
            )
            .filter(Boolean)
            .join(". ")
        : null) ||
      error.title ||
      (response.status === 0
        ? "Unable to connect. Check your internet connection and try again."
        : response.status >= 500
          ? "Server is temporarily unavailable. Please try again."
          : "Request failed");
    const code = (nested?.code as string) || (error.code as string);
    throw new ApiError(detail, response.status, code, nested ?? undefined);
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
  delete: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

function toQueryString(
  params?: Record<string, string | number | undefined>,
): string {
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
  avatarUrl?: string | null;
  customer?: Customer;
}

export interface Customer {
  id: string;
  customerNumber: string;
  status: string;
  kycLevel?: number;
  kycStatus?: "pending" | "verified" | "rejected";
  ghanaCardNumber?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
}

export type KycDocumentType =
  | "ghana_card"
  | "passport"
  | "voter_id"
  | "nhis"
  | "utility_bill"
  | "selfie";

export interface KycDocument {
  id: string;
  documentType: KycDocumentType;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
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
    payerPhone?: string;
  };
  withdrawal?: {
    disbursementMethod: string;
    disbursementPhone: string;
    status: string;
  };
  tenant?: { name: string; slug: string } | null;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  primaryColor?: string;
  logoUrl?: string | null;
  status?: string;
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
  register: (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      dateOfBirth?: string;
      gender?: "female" | "male" | "other" | "prefer_not_to_say";
    },
    tenantSlug = "",
  ) =>
    api.post<{
      userId: string;
      customerId: string;
      message: string;
      verificationRequired?: boolean;
    }>("/auth/register", data, { skipAuth: true, tenantSlug }),
  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; expiresIn: number }>(
      "/auth/refresh",
      { refreshToken },
      { skipAuth: true },
    ),
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
  forgotPassword: (email: string, tenantSlug = "") =>
    api.post<{ message: string }>(
      "/auth/password/forgot",
      { email },
      { skipAuth: true, tenantSlug },
    ),
  resetPassword: (
    data: { email: string; code: string; newPassword: string },
    tenantSlug = "",
  ) =>
    api.post<{ message: string }>("/auth/password/reset", data, {
      skipAuth: true,
      tenantSlug,
    }),
  sendOtp: (userId: string, channel: "email" | "phone", tenantSlug: string) =>
    api.post<{ message: string }>(
      "/auth/verify/send",
      { userId, channel },
      { skipAuth: true, tenantSlug },
    ),
  verifyOtp: (
    data: { userId: string; channel: "email" | "phone"; code: string },
    tenantSlug: string,
  ) =>
    api.post<{
      message: string;
      accountActive?: boolean;
      emailVerified?: boolean;
      phoneVerified?: boolean;
    }>("/auth/verify/confirm", data, { skipAuth: true, tenantSlug }),
  verificationStatus: (userId: string, tenantSlug: string) =>
    api.get<{
      emailVerified: boolean;
      phoneVerified: boolean;
      status: string;
    }>(`/auth/verify/status/${userId}`, { skipAuth: true, tenantSlug }),
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
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/users/me/password", data),
  deleteAccount: (data: { currentPassword: string }) =>
    api.delete<{ message: string }>("/users/me", data),
  registerPushToken: (data: {
    token: string;
    platform?: string;
    deviceName?: string;
    appVersion?: string;
  }) => api.put<{ registered: boolean }>("/users/me/push-token", data),
  removePushToken: (data: { token: string }) =>
    api.delete<{ removed: boolean }>("/users/me/push-token", data),
};

export interface InboxNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  status: string;
  screen: string;
  transactionId?: string;
  reference?: string;
  amount?: number;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  transactions: boolean;
  identity: boolean;
  security: true;
  account: boolean;
}

export const notificationApi = {
  listInbox: (params?: { cursor?: string; limit?: number }) =>
    api.get<{
      items: InboxNotification[];
      unreadCount: number;
      nextCursor: string | null;
    }>(`/notifications${toQueryString(params)}`),
  unreadCount: () =>
    api.get<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    api.patch<{ read: boolean; unreadCount: number }>(
      `/notifications/${id}/read`,
    ),
  markAllRead: () =>
    api.post<{ read: boolean; unreadCount: number }>("/notifications/read-all"),
  getPreferences: () =>
    api.get<NotificationPreferences>("/notifications/preferences"),
  updatePreferences: (
    data: Partial<
      Pick<
        NotificationPreferences,
        "pushEnabled" | "transactions" | "identity" | "account"
      >
    >,
  ) => api.put<NotificationPreferences>("/notifications/preferences", data),
  sendTest: () => api.post<{ queued: true }>("/notifications/test"),
};

export const kycApi = {
  getMyStatus: () => api.get<KycStatusResponse>("/kyc/my-status"),
  submit: (data: {
    documentType: KycDocumentType;
    idNumber: string;
    dateOfBirth?: string;
    address?: string;
    fileUrl: string;
  }) => api.post<KycDocument>("/kyc/submit", data),
  submitBatch: (data: {
    idNumber: string;
    dateOfBirth?: string;
    address?: string;
    documents: Array<{ documentType: KycDocumentType; fileUrl: string }>;
  }) =>
    api.post<{
      customerId: string;
      kycStatus: "pending";
      documents: KycDocument[];
    }>("/kyc/submit-batch", data),
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
    payerPhone?: string;
    bankCode?: string;
    idempotencyKey?: string;
  }) =>
    api.post<{
      transactionId: string;
      reference: string;
      status: string;
      payment: {
        id: string;
        gateway: string;
        paymentUrl?: string;
        expiresAt?: string;
        bankTransfer?: {
          bankCode: string;
          bankName: string;
          accountName?: string;
          accountNumber?: string;
          narration: string;
          instructions: string;
        } | null;
      };
    }>("/deposits", data),
  get: (id: string) => api.get<DepositDetail>(`/deposits/${id}`),
  list: (params?: {
    customer_id?: string;
    limit?: number;
    cursor?: string;
    status?: string;
  }) =>
    api.get<{
      items: Transaction[];
      cursor?: string;
      hasMore?: boolean;
    }>(`/deposits${toQueryString(params)}`),
};

export type DepositDetail = {
  id: string;
  reference: string;
  status: string;
  amount: string | number;
  createdAt: string;
  completedAt?: string | null;
  payment?: {
    status: string;
    paymentMethod?: string;
    payerPhone?: string | null;
    gatewayReference?: string | null;
    expiresAt?: string | null;
  } | null;
};

export const withdrawalApi = {
  requestWithdrawal: (data: {
    amount: number;
    disbursementMethod: string;
    disbursementPhone: string;
  }) => api.post<Transaction>("/withdrawals/request", data),
  list: (params?: { customer_id?: string; limit?: number }) =>
    api.get<{ items: Transaction[] }>(`/withdrawals${toQueryString(params)}`),
};

export const planApi = {
  listPlans: () => api.get<SavingsPlan[]>("/plans"),
  enroll: (data: { planId: string; targetAmount?: number }) =>
    api.post("/plans/enroll", data),
  listEnrollments: () =>
    api.get<CustomerPlanWithProgress[]>("/plans/my-enrollments"),
};

export const tenantApi = {
  getBySlug: (slug: string) =>
    api.get<TenantInfo>(`/tenants/${slug}`, {
      skipAuth: true,
      tenantSlug: slug,
    }),
};
