import { create } from "zustand";
import { storage } from "@/lib/storage";

export type ColorScheme = "light" | "dark";

interface ThemeState {
  colorScheme: ColorScheme;
  isHydrated: boolean;
  hydrateFromStorage: () => Promise<void>;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
}

/** Banking chrome default — dark first; users can switch in Appearance. */
export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: "dark",
  isHydrated: false,

  hydrateFromStorage: async () => {
    const stored = await storage.getItem(storage.keys.colorScheme);
    // First launch (no preference): dark. Explicit light/dark from settings wins.
    const colorScheme =
      stored === "light" ? "light" : stored === "dark" ? "dark" : "dark";
    set({ colorScheme, isHydrated: true });
  },

  setColorScheme: async (scheme) => {
    await storage.setItem(storage.keys.colorScheme, scheme);
    set({ colorScheme: scheme });
  },

  toggleColorScheme: async () => {
    const next = get().colorScheme === "light" ? "dark" : "light";
    await get().setColorScheme(next);
  },
}));
