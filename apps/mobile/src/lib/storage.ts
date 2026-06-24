import * as SecureStore from "expo-secure-store";

const KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  tenantSlug: "tenant_slug",
} as const;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
  keys: KEYS,
};
