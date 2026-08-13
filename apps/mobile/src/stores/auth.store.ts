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
import {
  clearBiometricCredentials,
  getBiometricSupport,
  isBiometricLoginReady,
  loadBiometricSession,
  saveBiometricSession,
  updateBiometricSession,
} from "@/lib/biometric";
import { AnalyticsEvents, analytics } from "@/lib/analytics";
import { monitoring } from "@/lib/monitoring";
import { unregisterDevicePushToken } from "@/lib/push-notifications";
import { prefetchAuthenticatedSession } from "@/lib/session-prefetch";
import { resetUserSessionCache } from "@/lib/session-cache";
import {
  clearRememberedSession,
  rememberSession,
  rememberedAccessToken,
} from "@/lib/session-memory";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { recordLastLoginAt, readLastLoginAt } from "@/lib/last-login";
import { storage } from "@/lib/storage";
import { resolveLoginTenantSlug } from "@/lib/tenant";
import { useAppLockStore } from "@/stores/app-lock.store";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantSlug?: string;
  avatarUrl?: string | null;
  customerId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string;
  /** ISO timestamp of the latest successful login on this device */
  lastLoginAt: string | null;
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
  /** Restore session via Face ID / fingerprint using a stored refresh token. */
  loginWithBiometric: () => Promise<LoginResponse>;
  /** Offer to save biometric login after a password login. */
  offerBiometricEnrollment: () => Promise<boolean>;
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
  queryClient.setQueryData(queryKeys.userProfile(profile.id), profile);
  return {
    user: {
      id: profile.id,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      roles: ["customer"],
      tenantSlug: tenantSlug || undefined,
      avatarUrl: profile.avatarUrl ?? null,
      customerId: profile.customer?.id,
    },
  };
}

function warmSession(userId: string, tenantSlug: string, customerId?: string) {
  void prefetchAuthenticatedSession(userId, tenantSlug, customerId)
    .then((profile) => {
      const nextCustomerId = profile?.customer?.id;
      if (!nextCustomerId) return;
      const current = useAuthStore.getState().user;
      if (current && current.id === userId && !current.customerId) {
        useAuthStore.setState({
          user: { ...current, customerId: nextCustomerId },
        });
      }
    })
    .catch(() => undefined);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  tenantSlug: "",
  lastLoginAt: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrateFromStorage: async () => {
    const [accessToken, refreshToken, tenantSlug, lastLoginAt] =
      await Promise.all([
        storage.getItem(storage.keys.accessToken),
        storage.getItem(storage.keys.refreshToken),
        storage.getItem(storage.keys.tenantSlug),
        readLastLoginAt(),
      ]);

    const slug = tenantSlug || "";
    rememberSession({ accessToken, tenantSlug: slug });

    set({
      accessToken,
      refreshToken,
      tenantSlug: slug,
      lastLoginAt,
      isAuthenticated: !!accessToken,
      isHydrated: true,
    });

    if (!refreshToken && !accessToken) return;

    void (async () => {
      try {
        if (accessToken) {
          const { user } = await loadProfile(slug);
          set({ user, isAuthenticated: true });
          warmSession(user.id, slug, user.customerId);
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
          const token =
            rememberedAccessToken() ||
            (await storage.getItem(storage.keys.accessToken));
          rememberSession({ accessToken: token, tenantSlug: slug });
          const { user } = await loadProfile(slug);
          set({
            user,
            accessToken: token,
            refreshToken,
            isAuthenticated: true,
          });
          warmSession(user.id, slug, user.customerId);
        } catch {
          await get().handleSessionExpired();
        }
      }
    })();
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
      rememberSession({
        accessToken: data.accessToken,
        tenantSlug: userTenant,
      });
      const lastLoginAt = await recordLastLoginAt();
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tenantSlug: userTenant,
        lastLoginAt,
        isAuthenticated: true,
      });
      warmSession(data.user.id, userTenant);
      analytics.track(AnalyticsEvents.loginSuccess);
      analytics.identify(data.user.id, { email: data.user.email });
      monitoring.setUser({ id: data.user.id, email: data.user.email });
      // Refresh stored biometric session silently when already enrolled.
      void updateBiometricSession({
        email: data.user.email,
        tenant: userTenant,
        refreshToken: data.refreshToken,
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

  loginWithBiometric: async () => {
    set({ isLoading: true, error: null });
    try {
      const support = await getBiometricSupport();
      if (!support.available) {
        throw new Error(
          support.hasHardware
            ? `Set up ${support.label} in your phone settings first.`
            : "Biometrics are not available on this device.",
        );
      }

      const session = await loadBiometricSession(support.label);
      if (!session?.refreshToken) {
        throw new Error(
          `No ${support.label} sign-in is saved. Log in with email once to enable it.`,
        );
      }

      await storage.setItem(storage.keys.refreshToken, session.refreshToken);
      if (session.tenant) {
        await storage.setItem(storage.keys.tenantSlug, session.tenant);
      }

      const refreshed = await refreshSessionFromStorage();
      if (!refreshed) {
        await clearBiometricCredentials();
        throw new Error(
          "Your saved sign-in expired. Please log in with email and password.",
        );
      }

      const accessToken =
        rememberedAccessToken() ||
        (await storage.getItem(storage.keys.accessToken));
      const refreshToken = await storage.getItem(storage.keys.refreshToken);
      if (!accessToken || !refreshToken) {
        throw new Error("Could not restore your session. Please log in again.");
      }

      rememberSession({
        accessToken,
        tenantSlug: session.tenant,
      });
      const { user } = await loadProfile(session.tenant);
      const lastLoginAt = await recordLastLoginAt();
      set({
        user,
        accessToken,
        refreshToken,
        tenantSlug: session.tenant,
        lastLoginAt,
        isAuthenticated: true,
      });
      warmSession(user.id, session.tenant, user.customerId);
      analytics.track(AnalyticsEvents.loginBiometric);
      analytics.identify(user.id, { email: user.email });
      monitoring.setUser({ id: user.id, email: user.email });
      void updateBiometricSession({
        email: user.email,
        tenant: session.tenant,
        refreshToken,
      });
      return {
        accessToken,
        refreshToken,
        expiresIn: 0,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          tenantSlug: user.tenantSlug,
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Biometric sign-in failed";
      set({ error: message });
      throw err instanceof Error ? err : new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  offerBiometricEnrollment: async () => {
    const { user, refreshToken, tenantSlug } = get();
    if (!user || !refreshToken) return false;
    const ready = await isBiometricLoginReady();
    if (ready) return true;
    const support = await getBiometricSupport();
    if (!support.available) return false;
    return saveBiometricSession(
      {
        email: user.email,
        tenant: tenantSlug || user.tenantSlug || "",
        refreshToken,
      },
      support.label,
    );
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
    useAppLockStore.setState({ locked: false, obscured: false });
    resetUserSessionCache();
    clearRememberedSession();
    analytics.reset();
    monitoring.setUser(null);
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
    clearRememberedSession();
    await unregisterDevicePushToken();
    await clearBiometricCredentials();
    await useAppLockStore.getState().reset();
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
    clearRememberedSession();
    await storage.removeItem(storage.keys.accessToken);
    await storage.removeItem(storage.keys.refreshToken);
  },
}));

setSessionExpiredHandler(() => {
  void useAuthStore.getState().handleSessionExpired();
});

setTokenRefreshedHandler((accessToken) => {
  rememberSession({ accessToken });
  useAuthStore.setState({ accessToken, isAuthenticated: true });
});
