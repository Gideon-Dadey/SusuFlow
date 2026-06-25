import { storage } from "./storage";
import { getApiBaseUrl } from "./config";

export async function clearLocalSession(): Promise<void> {
  await Promise.all([
    storage.removeItem(storage.keys.accessToken),
    storage.removeItem(storage.keys.refreshToken),
  ]);
}

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const refreshToken = await storage.getItem(storage.keys.refreshToken);
      if (!refreshToken) return null;

      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearLocalSession();
        return null;
      }

      const json = await response.json();
      const data = json.data ?? json;
      const accessToken = data.accessToken as string | undefined;
      if (!accessToken) {
        await clearLocalSession();
        return null;
      }

      await storage.setItem(storage.keys.accessToken, accessToken);
      return accessToken;
    } catch {
      await clearLocalSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function syncAccessTokenToStore(
  setToken: (token: string | null) => void,
): Promise<void> {
  const token = await storage.getItem(storage.keys.accessToken);
  setToken(token);
}
