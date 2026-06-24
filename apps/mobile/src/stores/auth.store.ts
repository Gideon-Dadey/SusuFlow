import { create } from "zustand";
import { authApi, LoginResponse, userApi } from "@/lib/api";
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
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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

    set({
      accessToken,
      refreshToken,
      tenantSlug: tenantSlug || "",
      isAuthenticated: !!accessToken,
      isHydrated: true,
    });

    if (accessToken) {
      try {
        const profile = await userApi.getMe();
        set({
          user: {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            roles: ["customer"],
            tenantSlug: tenantSlug || undefined,
          },
        });
      } catch {
        await storage.removeItem(storage.keys.accessToken);
        await storage.removeItem(storage.keys.refreshToken);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      }
    }
  },

  login: async (email, password, tenantSlug) => {
    set({ isLoading: true, error: null });
    try {
      const stored = get().tenantSlug;
      const slug = resolveLoginTenantSlug(email, tenantSlug, stored);
      const data = await authApi.login(email, password, slug);
      await persistSession(data, slug);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tenantSlug: slug,
        isAuthenticated: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore
      }
    }
    await storage.removeItem(storage.keys.accessToken);
    await storage.removeItem(storage.keys.refreshToken);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  clearError: () => set({ error: null }),
}));
