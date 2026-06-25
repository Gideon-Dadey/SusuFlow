import { create } from "zustand";
import { storage } from "@/lib/storage";

/** SecureStore keys may only use [a-zA-Z0-9._-] — no colons or slashes. */
function lastSeenStorageKey(userId: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${storage.keys.notificationsLastSeenAt}_${safeUserId}`;
}

interface NotificationState {
  lastSeenAt: string | null;
  isHydrated: boolean;
  activeUserId: string | null;
  hydrateForUser: (userId: string) => Promise<void>;
  reset: () => void;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  lastSeenAt: null,
  isHydrated: false,
  activeUserId: null,

  hydrateForUser: async (userId) => {
    if (!userId) return;

    const { activeUserId, isHydrated } = get();
    if (activeUserId === userId && isHydrated) return;

    const stored = await storage.getItem(lastSeenStorageKey(userId));
    if (stored) {
      set({ lastSeenAt: stored, activeUserId: userId, isHydrated: true });
      return;
    }

    const now = new Date().toISOString();
    await storage.setItem(lastSeenStorageKey(userId), now);
    set({ lastSeenAt: now, activeUserId: userId, isHydrated: true });
  },

  reset: () => {
    set({ lastSeenAt: null, isHydrated: false, activeUserId: null });
  },

  markAllRead: async () => {
    const { activeUserId } = get();
    if (!activeUserId) return;

    const now = new Date().toISOString();
    await storage.setItem(lastSeenStorageKey(activeUserId), now);
    set({ lastSeenAt: now });
  },
}));
