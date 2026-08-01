import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRIC_CREDS_KEY = "biometric_login_credentials";
const CREDENTIALS_VERSION = 2;

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** v2: stores refresh token only — never the account password. */
export type BiometricSession = {
  version: number;
  email: string;
  tenant: string;
  refreshToken: string;
};

export type BiometricSupport = {
  available: boolean;
  enrolled: boolean;
  hasHardware: boolean;
  label: string;
  icon: "face-recognition" | "fingerprint";
  authType: "face" | "fingerprint" | "biometric";
};

function parseSession(raw: string | null): BiometricSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BiometricSession>;
    if (
      typeof parsed.email === "string" &&
      typeof parsed.tenant === "string" &&
      typeof parsed.refreshToken === "string"
    ) {
      return {
        version: parsed.version ?? CREDENTIALS_VERSION,
        email: parsed.email,
        tenant: parsed.tenant,
        refreshToken: parsed.refreshToken,
      };
    }
  } catch {
    // invalid payload
  }
  return null;
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  const hasFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );

  let label = "Biometrics";
  let icon: BiometricSupport["icon"] = "fingerprint";
  let authType: BiometricSupport["authType"] = "biometric";

  if (Platform.OS === "ios" && hasFace) {
    label = "Face ID";
    icon = "face-recognition";
    authType = "face";
  } else if (hasFingerprint) {
    label = Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    icon = "fingerprint";
    authType = "fingerprint";
  } else if (hasFace) {
    label = Platform.OS === "android" ? "Face unlock" : "Face ID";
    icon = "face-recognition";
    authType = "face";
  }

  return {
    available: hasHardware && enrolled,
    enrolled,
    hasHardware,
    label,
    icon,
    authType,
  };
}

async function authenticateUser(promptLabel: string): Promise<boolean> {
  const support = await getBiometricSupport();
  if (!support.available) return false;

  const promptMessage =
    support.authType === "fingerprint"
      ? "Confirm fingerprint to sign in to SusuFlow"
      : support.authType === "face"
        ? "Confirm Face ID to sign in to SusuFlow"
        : `Confirm ${promptLabel} to sign in to SusuFlow`;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
    fallbackLabel: Platform.OS === "ios" ? "Use passcode" : "Use PIN",
    ...(Platform.OS === "android"
      ? { biometricsSecurityLevel: "strong" as const }
      : {}),
  });

  return result.success;
}

export async function hasBiometricCredentials(): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(
      BIOMETRIC_CREDS_KEY,
      SECURE_STORE_OPTIONS,
    );
    return parseSession(raw) !== null;
  } catch {
    return false;
  }
}

export async function getStoredBiometricEmail(): Promise<string | null> {
  try {
    const raw = await SecureStore.getItemAsync(
      BIOMETRIC_CREDS_KEY,
      SECURE_STORE_OPTIONS,
    );
    return parseSession(raw)?.email ?? null;
  } catch {
    return null;
  }
}

export async function saveBiometricSession(
  session: Omit<BiometricSession, "version">,
  promptLabel: string,
): Promise<boolean> {
  const support = await getBiometricSupport();
  if (!support.available) return false;

  const authed = await authenticateUser(`Enable ${promptLabel}`);
  if (!authed) return false;

  const payload: BiometricSession = {
    version: CREDENTIALS_VERSION,
    email: session.email,
    tenant: session.tenant,
    refreshToken: session.refreshToken,
  };

  await SecureStore.setItemAsync(
    BIOMETRIC_CREDS_KEY,
    JSON.stringify(payload),
    SECURE_STORE_OPTIONS,
  );
  return true;
}

export async function loadBiometricSession(
  promptLabel: string,
): Promise<BiometricSession | null> {
  try {
    const authed = await authenticateUser(promptLabel);
    if (!authed) return null;

    const raw = await SecureStore.getItemAsync(
      BIOMETRIC_CREDS_KEY,
      SECURE_STORE_OPTIONS,
    );
    return parseSession(raw);
  } catch {
    return null;
  }
}

export async function updateBiometricSession(
  session: Omit<BiometricSession, "version">,
): Promise<void> {
  const existing = await SecureStore.getItemAsync(
    BIOMETRIC_CREDS_KEY,
    SECURE_STORE_OPTIONS,
  );
  if (!parseSession(existing)) return;

  const payload: BiometricSession = {
    version: CREDENTIALS_VERSION,
    email: session.email,
    tenant: session.tenant,
    refreshToken: session.refreshToken,
  };

  await SecureStore.setItemAsync(
    BIOMETRIC_CREDS_KEY,
    JSON.stringify(payload),
    SECURE_STORE_OPTIONS,
  );
}

export async function clearBiometricCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(
      BIOMETRIC_CREDS_KEY,
      SECURE_STORE_OPTIONS,
    );
  } catch {
    // ignore
  }
}

export async function isBiometricLoginReady(): Promise<boolean> {
  const [support, saved] = await Promise.all([
    getBiometricSupport(),
    hasBiometricCredentials(),
  ]);
  return support.available && saved;
}

/** @deprecated Use saveBiometricSession */
export const saveBiometricCredentials = saveBiometricSession;
/** @deprecated Use loadBiometricSession */
export const loadBiometricCredentials = loadBiometricSession;
/** @deprecated Use updateBiometricSession */
export const updateBiometricCredentials = updateBiometricSession;
