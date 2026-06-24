import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, LoginResponse } from "@/lib/api";
import { getDashboardPath, resolveLoginTenantSlug } from "@/lib/utils";

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
  isLoading: boolean;
  error: string | null;

  setTenantSlug: (slug: string) => void;
  login: (
    email: string,
    password: string,
    tenantSlug?: string,
  ) => Promise<string>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ userId: string; customerId: string; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  hydrate: (data: LoginResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantSlug: "",
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTenantSlug: (slug) => {
        const trimmed = slug.trim();
        if (trimmed) {
          localStorage.setItem("tenant_slug", trimmed);
          set({ tenantSlug: trimmed });
        } else {
          localStorage.removeItem("tenant_slug");
          set({ tenantSlug: "" });
        }
      },

      hydrate: (data) => {
        localStorage.setItem("access_token", data.accessToken);
        localStorage.setItem("refresh_token", data.refreshToken);
        const resolvedSlug = data.user.tenantSlug || "";
        if (resolvedSlug) {
          localStorage.setItem("tenant_slug", resolvedSlug);
        } else {
          localStorage.removeItem("tenant_slug");
        }
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          tenantSlug: resolvedSlug,
          isAuthenticated: true,
        });
      },

      login: async (email, password, tenantSlug) => {
        set({ isLoading: true, error: null });
        try {
          const slug = resolveLoginTenantSlug(email, tenantSlug);
          const data = await authApi.login(email, password, slug);
          get().hydrate(data);
          get().setTenantSlug(slug);
          return getDashboardPath(data.user.roles);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          return await authApi.register(data);
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
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {
            // ignore
          }
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "susuflow-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tenantSlug: state.tenantSlug,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem("access_token", state.accessToken);
        }
      },
    },
  ),
);
