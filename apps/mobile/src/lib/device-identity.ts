/**
 * Stable installation identity for trusted-device login alerts.
 * Survives logout; cleared only if the app is uninstalled / SecureStore wiped.
 */
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const FINGERPRINT_KEY = "susuflow_device_fingerprint_v1";

const SECURE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function deviceLabel(): string {
  const parts = [
    Device.brand,
    Device.modelName || Device.modelId,
    Device.osName,
  ].filter(Boolean);
  const label = parts.join(" ").trim();
  return label.slice(0, 120) || "SusuFlow mobile";
}

export async function getDeviceFingerprint(): Promise<string> {
  try {
    const existing = await SecureStore.getItemAsync(
      FINGERPRINT_KEY,
      SECURE_OPTS,
    );
    if (existing && existing.length >= 16) return existing;
  } catch {
    // fall through and mint a new id
  }

  const id = `sf_${Crypto.randomUUID().replace(/-/g, "")}`;
  try {
    await SecureStore.setItemAsync(FINGERPRINT_KEY, id, SECURE_OPTS);
  } catch {
    // Still return an ephemeral id this session so API can correlate retries.
  }
  return id;
}

export async function getLoginDeviceContext(): Promise<{
  deviceFingerprint: string;
  deviceName: string;
}> {
  const deviceFingerprint = await getDeviceFingerprint();
  return {
    deviceFingerprint,
    deviceName: deviceLabel(),
  };
}
