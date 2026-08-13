import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_LOCK_PIN_MAX, APP_LOCK_PIN_MIN } from "@/lib/app-lock";
import { useAppLockStore } from "@/stores/app-lock.store";
import { authChrome } from "@/theme/auth-chrome";
import { radius, spacing, typography } from "@/theme/tokens";

/**
 * Step-up confirmation for withdrawals (and other money moves).
 * If app lock is off, resolves true immediately.
 * If biometrics enabled, prompts Face ID / fingerprint first, then PIN modal.
 */
export function useMoneyStepUp() {
  const enabled = useAppLockStore((s) => s.enabled);
  const biometricUnlock = useAppLockStore((s) => s.biometricUnlock);
  const confirmSensitiveAction = useAppLockStore(
    (s) => s.confirmSensitiveAction,
  );

  const [visible, setVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("Confirm withdrawal");
  const [resolver, setResolver] = useState<((ok: boolean) => void) | null>(
    null,
  );

  const finish = useCallback(
    (ok: boolean) => {
      setVisible(false);
      setPin("");
      setError("");
      setBusy(false);
      resolver?.(ok);
      setResolver(null);
    },
    [resolver],
  );

  const requestStepUp = useCallback(
    async (actionReason = "Confirm withdrawal") => {
      if (!enabled) return true;

      if (biometricUnlock) {
        const ok = await confirmSensitiveAction({ reason: actionReason });
        if (ok) return true;
      }

      return new Promise<boolean>((resolve) => {
        setReason(actionReason);
        setResolver(() => resolve);
        setVisible(true);
      });
    },
    [enabled, biometricUnlock, confirmSensitiveAction],
  );

  const submitPin = async () => {
    if (pin.length < APP_LOCK_PIN_MIN) {
      setError(`Enter your ${APP_LOCK_PIN_MIN}–${APP_LOCK_PIN_MAX} digit PIN.`);
      return;
    }
    setBusy(true);
    setError("");
    const ok = await confirmSensitiveAction({ reason, pin });
    setBusy(false);
    if (!ok) {
      setError("Incorrect PIN. Try again.");
      setPin("");
      return;
    }
    finish(true);
  };

  const insets = useSafeAreaInsets();

  const StepUpModal = (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => finish(false)}
    >
      <View style={[styles.backdrop, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{reason}</Text>
          <Text style={styles.subtitle}>
            Enter your SusuFlow app lock PIN to continue.
          </Text>
          <TextInput
            value={pin}
            onChangeText={(v) => {
              setPin(v.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX));
              setError("");
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={APP_LOCK_PIN_MAX}
            placeholder="PIN"
            placeholderTextColor={authChrome.inkMuted}
            style={styles.input}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.row}>
            <Pressable
              onPress={() => finish(false)}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void submitPin()}
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#0A0A0A" />
              ) : (
                <Text style={styles.primaryLabel}>Confirm</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return { requestStepUp, StepUpModal, appLockEnabled: enabled };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    backgroundColor: authChrome.field,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    color: authChrome.ink,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: authChrome.inkMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 20,
    letterSpacing: 6,
    color: authChrome.ink,
    textAlign: "center",
  },
  error: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: "#F87171",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
  },
  secondaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: authChrome.ink,
  },
  primaryBtn: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
  },
  primaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: "#0A0A0A",
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.6 },
});
