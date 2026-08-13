import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import {
  APP_LOCK_BACKGROUND_MS,
  changeAppLockPin,
  disableAppLock as clearLockStorage,
  enableAppLock as persistLock,
  isAppLockBiometricEnabled,
  isAppLockEnabled,
  setAppLockBiometricEnabled,
  verifyAppLockPin,
} from "@/lib/app-lock";
import { getBiometricSupport } from "@/lib/biometric";
import { create } from "zustand";
import type { AppStateStatus } from "react-native";

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
  changePin: (currentPin: string, nextPin: string) => Promise<void>;
  setBiometricUnlock: (enabled: boolean) => Promise<void>;
  reset: () => Promise<void>;
  lock: () => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  /**
   * Step-up for money movement. Does not change the session lock state.
   * Returns true when app lock is off, or when the user confirms biometrics/PIN.
   */
  confirmSensitiveAction: (opts?: {
    reason?: string;
    pin?: string;
  }) => Promise<boolean>;
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

  changePin: async (currentPin: string, nextPin: string) => {
    await changeAppLockPin(currentPin, nextPin);
  },

  setBiometricUnlock: async (enabled: boolean) => {
    if (enabled) {
      if (!get().enabled) {
        throw new Error("Turn on App lock before enabling biometrics.");
      }
      const support = await getBiometricSupport();
      if (!support.available) {
        throw new Error(
          support.hasHardware
            ? `Set up ${support.label} in your phone settings first.`
            : "This device does not support biometrics.",
        );
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${support.label} for SusuFlow`,
        cancelLabel: "Cancel",
        disableDeviceFallback: true,
        ...(Platform.OS === "android"
          ? { biometricsSecurityLevel: "strong" as const }
          : {}),
      });
      if (!result.success) {
        throw new Error(`${support.label} confirmation was cancelled.`);
      }
    }
    await setAppLockBiometricEnabled(enabled);
    set({ biometricUnlock: enabled });
  },

  reset: async () => {
    await clearLockStorage();
    set({
      enabled: false,
      biometricUnlock: false,
      locked: false,
      obscured: false,
      backgroundedAt: null,
    });
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

  confirmSensitiveAction: async (opts) => {
    const { enabled, biometricUnlock } = get();
    if (!enabled) return true;

    const reason = opts?.reason ?? "Confirm this action";

    if (biometricUnlock) {
      const support = await getBiometricSupport();
      if (support.available) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: reason,
          cancelLabel: "Cancel",
          disableDeviceFallback: false,
          fallbackLabel: Platform.OS === "ios" ? "Use passcode" : "Use PIN",
          ...(Platform.OS === "android"
            ? { biometricsSecurityLevel: "strong" as const }
            : {}),
        });
        if (result.success) return true;
      }
    }

    if (opts?.pin) {
      return verifyAppLockPin(opts.pin);
    }

    // Biometric cancelled / unavailable — caller should collect PIN.
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
