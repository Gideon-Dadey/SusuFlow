import { create } from "zustand";
import {
  ApiError,
  authApi,
  LoginResponse,
  refreshSessionFromStorage,
  setSessionExpiredHandler,
  setTokenRefreshedHandler,
  userApi,
} from "@/lib/api";
import { clearBiometricCredentials } from "@/lib/biometric";
import { unregisterDevicePushToken } from "@/lib/push-notifications";
import { prefetchAuthenticatedSession } from "@/lib/session-prefetch";
import { resetUserSessionCache } from "@/lib/session-cache";
import { storage } from "@/lib/storage";
import { resolveLoginTenantSlug } from "@/lib/tenant";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantSlug?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrateFromStorage: () => Promise<void>;
  login: (
    email: string,
    password: string,
    tenantSlug?: string,
  ) => Promise<LoginResponse>;
  loginWithRefreshToken: (
    refreshToken: string,
    tenantSlug: string,
    email: string,
  ) => Promise<void>;
  register: (
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
    },
    tenantSlug?: string,
  ) => Promise<{
    userId: string;
    customerId: string;
    message: string;
    verificationRequired?: boolean;
  }>;
  logout: () => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  clearError: () => void;
  handleSessionExpired: () => Promise<void>;
}

async function persistSession(data: LoginResponse, tenantSlug: string) {
  await storage.setItem(storage.keys.accessToken, data.accessToken);
  await storage.setItem(storage.keys.refreshToken, data.refreshToken);
  if (tenantSlug) {
    await storage.setItem(storage.keys.tenantSlug, tenantSlug);
  } else {
    await storage.removeItem(storage.keys.tenantSlug);
  }
}

async function loadProfile(tenantSlug: string) {
  const profile = await userApi.getMe();
  return {
    user: {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      roles: ["customer"],
      tenantSlug: tenantSlug || undefined,
    },
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  tenantSlug: "",
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrateFromStorage: async () => {
    const [accessToken, refreshToken, tenantSlug] = await Promise.all([
      storage.getItem(storage.keys.accessToken),
      storage.getItem(storage.keys.refreshToken),
      storage.getItem(storage.keys.tenantSlug),
    ]);

    const slug = tenantSlug || "";

    set({
      accessToken,
      refreshToken,
      tenantSlug: slug,
      isAuthenticated: !!accessToken,
      isHydrated: true,
    });

    if (!refreshToken && !accessToken) return;

    try {
      if (accessToken) {
        const { user } = await loadProfile(slug);
        set({ user, isAuthenticated: true });
        return;
      }
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) {
        await get().handleSessionExpired();
        return;
      }
    }

    if (refreshToken) {
      const refreshed = await refreshSessionFromStorage();
      if (!refreshed) {
        await get().handleSessionExpired();
        return;
      }
      try {
        const token = await storage.getItem(storage.keys.accessToken);
        const { user } = await loadProfile(slug);
        set({
          user,
          accessToken: token,
          refreshToken,
          isAuthenticated: true,
        });
      } catch {
        await get().handleSessionExpired();
      }
    }
  },

  login: async (email, password, tenantSlug) => {
    set({ isLoading: true, error: null });
    try {
      const stored = get().tenantSlug;
      const slug = resolveLoginTenantSlug(email, tenantSlug, stored);
      const data = await authApi.login(email, password, slug);
      const userTenant = data.user?.tenantSlug || slug || "";
      resetUserSessionCache();
      await persistSession(data, userTenant);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tenantSlug: userTenant,
        isAuthenticated: true,
      });
      // Non-blocking prefetch in background so UI navigation is instant
      void prefetchAuthenticatedSession(data.user.id).catch((prefetchErr) => {
        console.warn("Session prefetch warning:", prefetchErr);
      });
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        set({ error: err.message });
        throw err;
      }
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithRefreshToken: async (refreshToken, tenantSlug, email) => {
    set({ isLoading: true, error: null });
    try {
      await storage.setItem(storage.keys.refreshToken, refreshToken);
      if (tenantSlug) {
        await storage.setItem(storage.keys.tenantSlug, tenantSlug);
      }
      const refreshed = await authApi.refresh(refreshToken);
      resetUserSessionCache();
      await storage.setItem(storage.keys.accessToken, refreshed.accessToken);
      const { user } = await loadProfile(tenantSlug);
      set({
        user: { ...user, email },
        accessToken: refreshed.accessToken,
        refreshToken,
        tenantSlug,
        isAuthenticated: true,
      });
      await prefetchAuthenticatedSession(user.id);
    } catch (err) {
      await clearBiometricCredentials();
      const message =
        err instanceof Error ? err.message : "Biometric sign in failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data, tenantSlug) => {
    set({ isLoading: true, error: null });
    try {
      const slug = tenantSlug?.trim() || get().tenantSlug;
      const result = await authApi.register(data, slug);
      if (slug) {
        await storage.setItem(storage.keys.tenantSlug, slug);
        set({ tenantSlug: slug });
      }
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    resetUserSessionCache();
    await unregisterDevicePushToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore
      }
    }
    await storage.removeItem(storage.keys.accessToken);
    await storage.removeItem(storage.keys.refreshToken);
  },

  deleteAccount: async (currentPassword: string) => {
    await userApi.deleteAccount({ currentPassword });
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    resetUserSessionCache();
    await unregisterDevicePushToken();
    await clearBiometricCredentials();
    await storage.removeItem(storage.keys.accessToken);
    await storage.removeItem(storage.keys.refreshToken);
  },

  clearError: () => set({ error: null }),

  handleSessionExpired: async () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    resetUserSessionCache();
    await storage.removeItem(storage.keys.accessToken);
    await storage.removeItem(storage.keys.refreshToken);
  },
}));

setSessionExpiredHandler(() => {
  void useAuthStore.getState().handleSessionExpired();
});

setTokenRefreshedHandler((accessToken) => {
  useAuthStore.setState({ accessToken, isAuthenticated: true });
});
