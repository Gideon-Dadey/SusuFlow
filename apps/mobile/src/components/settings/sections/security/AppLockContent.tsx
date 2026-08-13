import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  SettingRow,
  SettingsSwitch,
} from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import {
  APP_LOCK_PIN_MAX,
  APP_LOCK_PIN_MIN,
  isValidLockPin,
} from "@/lib/app-lock";
import { getBiometricSupport } from "@/lib/biometric";
import { useAppLockStore } from "@/stores/app-lock.store";
import { toast } from "@/stores/toast.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Mode = "overview" | "enable" | "change" | "disable";

export function AppLockContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const lockEnabled = useAppLockStore((s) => s.enabled);
  const biometricUnlock = useAppLockStore((s) => s.biometricUnlock);
  const enableLock = useAppLockStore((s) => s.enable);
  const disableLock = useAppLockStore((s) => s.disable);
  const changePin = useAppLockStore((s) => s.changePin);
  const setBiometricUnlock = useAppLockStore((s) => s.setBiometricUnlock);

  const [mode, setMode] = useState<Mode>(lockEnabled ? "overview" : "enable");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    setMode(lockEnabled ? "overview" : "enable");
  }, [lockEnabled]);

  useEffect(() => {
    void getBiometricSupport().then((support) => {
      setBiometricLabel(support.label);
      setBiometricAvailable(support.available);
    });
  }, []);

  const clearFields = () => {
    setPin("");
    setPinConfirm("");
    setCurrentPin("");
  };

  const sanitizePin = (value: string) =>
    value.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX);

  const handleEnable = async () => {
    if (!isValidLockPin(pin)) {
      toast.error(`PIN must be ${APP_LOCK_PIN_MIN}–${APP_LOCK_PIN_MAX} digits`);
      return;
    }
    if (pin !== pinConfirm) {
      toast.error("PINs don’t match. Try again.");
      return;
    }
    setBusy(true);
    try {
      await enableLock(pin);
      clearFields();
      setMode("overview");
      toast.success("App lock is on");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not enable App lock",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleChangePin = async () => {
    if (!isValidLockPin(pin)) {
      toast.error(
        `New PIN must be ${APP_LOCK_PIN_MIN}–${APP_LOCK_PIN_MAX} digits`,
      );
      return;
    }
    if (pin !== pinConfirm) {
      toast.error("New PINs don’t match. Try again.");
      return;
    }
    setBusy(true);
    try {
      await changePin(currentPin, pin);
      clearFields();
      setMode("overview");
      toast.success("PIN updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change PIN");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!isValidLockPin(currentPin)) {
      toast.error("Enter your current PIN to turn off App lock");
      return;
    }
    setBusy(true);
    try {
      await disableLock(currentPin);
      clearFields();
      setMode("enable");
      toast.success("App lock is off");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not turn off App lock",
      );
    } finally {
      setBusy(false);
    }
  };

  const onBiometricToggle = async (next: boolean) => {
    setBusy(true);
    try {
      await setBiometricUnlock(next);
      toast.success(
        next ? `${biometricLabel} is on` : `${biometricLabel} is off`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update biometrics",
      );
    } finally {
      setBusy(false);
    }
  };

  const statusBg = lockEnabled
    ? isDark
      ? "rgba(52,211,153,0.14)"
      : "rgba(5,150,105,0.12)"
    : isDark
      ? "rgba(255,255,255,0.08)"
      : "#F1F5F9";
  const statusFg = lockEnabled
    ? isDark
      ? "#34D399"
      : "#047857"
    : colors.mutedForeground;

  if (mode === "enable") {
    return (
      <View style={styles.stack}>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Create a {APP_LOCK_PIN_MIN}–{APP_LOCK_PIN_MAX} digit PIN. When you
          leave SusuFlow, balances stay hidden until you unlock.
        </Text>
        <Input
          label="Create PIN"
          value={pin}
          onChangeText={(v) => setPin(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
          textContentType="oneTimeCode"
        />
        <Input
          label="Confirm PIN"
          value={pinConfirm}
          onChangeText={(v) => setPinConfirm(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
          textContentType="oneTimeCode"
        />
        <Button
          title="Turn on App lock"
          loading={busy}
          disabled={!isValidLockPin(pin) || pin !== pinConfirm || busy}
          onPress={() => void handleEnable()}
        />
        {lockEnabled ? (
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => {
              clearFields();
              setMode("overview");
            }}
          />
        ) : (
          <Button
            title="Not now"
            variant="outline"
            onPress={() => router.back()}
          />
        )}
      </View>
    );
  }

  if (mode === "change") {
    return (
      <View style={styles.stack}>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Enter your current PIN, then choose a new one.
        </Text>
        <Input
          label="Current PIN"
          value={currentPin}
          onChangeText={(v) => setCurrentPin(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
        />
        <Input
          label="New PIN"
          value={pin}
          onChangeText={(v) => setPin(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
        />
        <Input
          label="Confirm new PIN"
          value={pinConfirm}
          onChangeText={(v) => setPinConfirm(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
        />
        <Button
          title="Save new PIN"
          loading={busy}
          disabled={
            !isValidLockPin(currentPin) ||
            !isValidLockPin(pin) ||
            pin !== pinConfirm ||
            busy
          }
          onPress={() => void handleChangePin()}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={() => {
            clearFields();
            setMode("overview");
          }}
        />
      </View>
    );
  }

  if (mode === "disable") {
    return (
      <View style={styles.stack}>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Enter your PIN to turn off App lock on this device.
        </Text>
        <Input
          label="Current PIN"
          value={currentPin}
          onChangeText={(v) => setCurrentPin(sanitizePin(v))}
          keyboardType="number-pad"
          secureTextEntry
        />
        <Button
          title="Turn off App lock"
          variant="outline"
          loading={busy}
          disabled={!isValidLockPin(currentPin) || busy}
          onPress={() => void handleDisable()}
        />
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => {
            clearFields();
            setMode("overview");
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={[styles.statusCard, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusLabel, { color: statusFg }]}>
          {lockEnabled ? "App lock is on" : "App lock is off"}
        </Text>
        <Text style={[styles.statusCopy, { color: colors.mutedForeground }]}>
          {lockEnabled
            ? "Your PIN is required when you return after leaving the app."
            : "Turn this on to hide balances if someone opens your phone."}
        </Text>
      </View>

      <SettingsPanel>
        <SettingRow
          icon="fingerprint"
          title={biometricLabel}
          subtitle={
            biometricAvailable
              ? `Unlock with ${biometricLabel}`
              : `Unavailable — set up ${biometricLabel} on this phone`
          }
          right={
            <SettingsSwitch
              value={biometricUnlock}
              disabled={busy || (!biometricAvailable && !biometricUnlock)}
              onValueChange={(next) => void onBiometricToggle(next)}
            />
          }
        />
        <SettingRow
          icon="key"
          title="Change PIN"
          subtitle="Update the digits used to unlock"
          onPress={() => {
            clearFields();
            setMode("change");
          }}
        />
        <SettingRow
          icon="lock"
          title="Turn off App lock"
          subtitle="Remove PIN protection on this device"
          onPress={() => {
            clearFields();
            setMode("disable");
          }}
          showDivider={false}
        />
      </SettingsPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  lead: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  statusCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
  },
  statusLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
  },
  statusCopy: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
