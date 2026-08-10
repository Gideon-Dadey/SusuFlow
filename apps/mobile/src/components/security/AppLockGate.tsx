import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark } from "@/components/profile/BrandMark";
import { Button } from "@/components/Button";
import { APP_LOCK_PIN_MAX, APP_LOCK_PIN_MIN } from "@/lib/app-lock";
import { useAppLockStore } from "@/stores/app-lock.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function AppLockGate() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const locked = useAppLockStore((s) => s.locked);
  const obscured = useAppLockStore((s) => s.obscured);
  const biometricUnlock = useAppLockStore((s) => s.biometricUnlock);
  const unlockWithPin = useAppLockStore((s) => s.unlockWithPin);
  const unlockWithBiometric = useAppLockStore((s) => s.unlockWithBiometric);

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!locked) {
      setPin("");
      setError("");
      return;
    }
    if (biometricUnlock) {
      void (async () => {
        setBusy(true);
        await unlockWithBiometric();
        setBusy(false);
      })();
    }
  }, [locked, biometricUnlock, unlockWithBiometric]);

  if (obscured && !locked) {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.privacyShield,
          { backgroundColor: colors.splashBackground },
        ]}
      />
    );
  }

  if (!locked) return null;

  const submitPin = async () => {
    if (pin.length < APP_LOCK_PIN_MIN) {
      setError(`Enter your ${APP_LOCK_PIN_MIN}–${APP_LOCK_PIN_MAX} digit PIN.`);
      return;
    }
    setBusy(true);
    setError("");
    const ok = await unlockWithPin(pin);
    setBusy(false);
    if (!ok) {
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  };

  return (
    <View
      style={[
        styles.lockScreen,
        {
          backgroundColor: isDark ? "#050505" : "#0B1220",
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
      accessibilityViewIsModal
    >
      <BrandMark size={56} />
      <Text style={styles.title}>SusuFlow is locked</Text>
      <Text style={styles.subtitle}>
        Enter your app PIN to view balances and continue.
      </Text>

      <TextInput
        value={pin}
        onChangeText={(value) => {
          const next = value.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX);
          setPin(next);
          setError("");
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={APP_LOCK_PIN_MAX}
        placeholder="••••"
        placeholderTextColor="rgba(255,255,255,0.35)"
        style={styles.pinInput}
        editable={!busy}
        accessibilityLabel="App lock PIN"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button
          title={busy ? "Unlocking…" : "Unlock"}
          loading={busy}
          onPress={() => void submitPin()}
          style={styles.unlockBtn}
        />
        {biometricUnlock ? (
          <Pressable
            onPress={() => void unlockWithBiometric()}
            disabled={busy}
            style={styles.bioLink}
          >
            <Text style={styles.bioText}>Use biometrics</Text>
          </Pressable>
        ) : null}
      </View>

      {busy ? (
        <ActivityIndicator color="#ffffff" style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  privacyShield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  lockScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    marginTop: spacing.md,
    fontFamily: typography.roles.headline,
    fontSize: typography.size.xl,
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  pinInput: {
    marginTop: spacing.md,
    width: "70%",
    maxWidth: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 10,
    paddingVertical: 14,
    fontFamily: typography.roles.amount,
  },
  error: {
    color: "#FDA4AF",
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 280,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  unlockBtn: {
    alignSelf: "stretch",
  },
  bioLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  bioText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
});
