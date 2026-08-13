import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import {
  APP_LOCK_PIN_MAX,
  APP_LOCK_PIN_MIN,
  isValidLockPin,
} from "./app-lock-pin";

export {
  APP_LOCK_PIN_MAX,
  APP_LOCK_PIN_MIN,
  isValidLockPin,
} from "./app-lock-pin";

const PIN_KEY = "app_lock_pin_v1";
const ENABLED_KEY = "app_lock_enabled_v1";
const BIOMETRIC_UNLOCK_KEY = "app_lock_biometric_v1";

const SECURE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** Lock after this long in background (ms). */
export const APP_LOCK_BACKGROUND_MS = 12_000;

type PinPayload = { salt: string; hash: string };

function randomSalt(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `susuflow-lock:${salt}:${pin}`,
  );
}

export async function isAppLockEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(ENABLED_KEY, SECURE_OPTS);
    const pin = await SecureStore.getItemAsync(PIN_KEY, SECURE_OPTS);
    return enabled === "1" && !!pin;
  } catch {
    return false;
  }
}

export async function isAppLockBiometricEnabled(): Promise<boolean> {
  try {
    return (
      (await SecureStore.getItemAsync(BIOMETRIC_UNLOCK_KEY, SECURE_OPTS)) ===
      "1"
    );
  } catch {
    return false;
  }
}

export async function setAppLockBiometricEnabled(
  enabled: boolean,
): Promise<void> {
  await SecureStore.setItemAsync(
    BIOMETRIC_UNLOCK_KEY,
    enabled ? "1" : "0",
    SECURE_OPTS,
  );
}

export async function enableAppLock(pin: string): Promise<void> {
  if (!isValidLockPin(pin)) {
    throw new Error(
      `PIN must be ${APP_LOCK_PIN_MIN}–${APP_LOCK_PIN_MAX} digits.`,
    );
  }
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  const payload: PinPayload = { salt, hash };
  await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(payload), SECURE_OPTS);
  await SecureStore.setItemAsync(ENABLED_KEY, "1", SECURE_OPTS);
}

export async function disableAppLock(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY, SECURE_OPTS);
    await SecureStore.deleteItemAsync(ENABLED_KEY, SECURE_OPTS);
    await SecureStore.deleteItemAsync(BIOMETRIC_UNLOCK_KEY, SECURE_OPTS);
  } catch {
    // ignore
  }
}

export async function verifyAppLockPin(pin: string): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(PIN_KEY, SECURE_OPTS);
    if (!raw) return false;
    const payload = JSON.parse(raw) as PinPayload;
    if (!payload?.salt || !payload?.hash) return false;
    const hash = await hashPin(pin, payload.salt);
    return hash === payload.hash;
  } catch {
    return false;
  }
}

export async function changeAppLockPin(
  currentPin: string,
  nextPin: string,
): Promise<void> {
  const ok = await verifyAppLockPin(currentPin);
  if (!ok) throw new Error("Current PIN is incorrect.");
  await enableAppLock(nextPin);
}
