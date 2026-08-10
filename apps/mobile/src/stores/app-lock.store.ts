import { create } from "zustand";
import {
  APP_LOCK_BACKGROUND_MS,
  disableAppLock as clearLockStorage,
  enableAppLock as persistLock,
  isAppLockBiometricEnabled,
  isAppLockEnabled,
  setAppLockBiometricEnabled,
  verifyAppLockPin,
} from "@/lib/app-lock";
import { getBiometricSupport } from "@/lib/biometric";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform, type AppStateStatus } from "react-native";

interface AppLockState {
  hydrated: boolean;
  enabled: boolean;
  biometricUnlock: boolean;
  locked: boolean;
  obscured: boolean;
  backgroundedAt: number | null;
  hydrate: () => Promise<void>;
  enable: (pin: string) => Promise<void>;
  disable: (pin: string) => Promise<void>;
  setBiometricUnlock: (enabled: boolean) => Promise<void>;
  lock: () => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  onAppStateChange: (next: AppStateStatus) => void;
}

export const useAppLockStore = create<AppLockState>((set, get) => ({
  hydrated: false,
  enabled: false,
  biometricUnlock: false,
  locked: false,
  obscured: false,
  backgroundedAt: null,

  hydrate: async () => {
    const [enabled, biometricUnlock] = await Promise.all([
      isAppLockEnabled(),
      isAppLockBiometricEnabled(),
    ]);
    set({
      hydrated: true,
      enabled,
      biometricUnlock,
      // Lock immediately on cold start when enabled
      locked: enabled,
    });
  },

  enable: async (pin: string) => {
    await persistLock(pin);
    set({ enabled: true, locked: false });
  },

  disable: async (pin: string) => {
    const ok = await verifyAppLockPin(pin);
    if (!ok) throw new Error("PIN is incorrect.");
    await clearLockStorage();
    set({
      enabled: false,
      biometricUnlock: false,
      locked: false,
      obscured: false,
    });
  },

  setBiometricUnlock: async (enabled: boolean) => {
    await setAppLockBiometricEnabled(enabled);
    set({ biometricUnlock: enabled });
  },

  lock: () => {
    if (!get().enabled) return;
    set({ locked: true, obscured: false });
  },

  unlockWithPin: async (pin: string) => {
    const ok = await verifyAppLockPin(pin);
    if (ok) set({ locked: false, obscured: false, backgroundedAt: null });
    return ok;
  },

  unlockWithBiometric: async () => {
    const { enabled, biometricUnlock } = get();
    if (!enabled || !biometricUnlock) return false;
    const support = await getBiometricSupport();
    if (!support.available) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock SusuFlow",
      cancelLabel: "Use PIN",
      disableDeviceFallback: false,
      fallbackLabel: Platform.OS === "ios" ? "Use passcode" : "Use PIN",
      ...(Platform.OS === "android"
        ? { biometricsSecurityLevel: "strong" as const }
        : {}),
    });

    if (result.success) {
      set({ locked: false, obscured: false, backgroundedAt: null });
      return true;
    }
    return false;
  },

  onAppStateChange: (next) => {
    const { enabled, backgroundedAt } = get();
    if (!enabled) {
      set({ obscured: false, backgroundedAt: null });
      return;
    }

    if (next === "background" || next === "inactive") {
      set({
        obscured: true,
        backgroundedAt: backgroundedAt ?? Date.now(),
      });
      return;
    }

    if (next === "active") {
      const started = get().backgroundedAt;
      const elapsed = started ? Date.now() - started : 0;
      if (elapsed >= APP_LOCK_BACKGROUND_MS) {
        set({ locked: true, obscured: false, backgroundedAt: null });
      } else {
        set({ obscured: false, backgroundedAt: null });
      }
    }
  },
}));
