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

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: "light",
  isHydrated: false,

  hydrateFromStorage: async () => {
    const stored = await storage.getItem(storage.keys.colorScheme);
    const colorScheme = stored === "dark" ? "dark" : "light";
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
