import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SettingRow } from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { SettingsDivider } from "@/components/settings/SettingsGroup";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { APP_LOCK_PIN_MAX, APP_LOCK_PIN_MIN } from "@/lib/app-lock";
import { userApi } from "@/lib/api";
import {
  clearBiometricCredentials,
  getBiometricSupport,
} from "@/lib/biometric";
import { useAppLockStore } from "@/stores/app-lock.store";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function SecuritySettingsContent() {
  const { colors } = useTheme();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const lockEnabled = useAppLockStore((s) => s.enabled);
  const biometricUnlock = useAppLockStore((s) => s.biometricUnlock);
  const enableLock = useAppLockStore((s) => s.enable);
  const disableLock = useAppLockStore((s) => s.disable);
  const setBiometricUnlock = useAppLockStore((s) => s.setBiometricUnlock);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [lockPinConfirm, setLockPinConfirm] = useState("");
  const [disablePin, setDisablePin] = useState("");
  const [lockBusy, setLockBusy] = useState(false);

  useEffect(() => {
    void getBiometricSupport().then((support) => {
      setBiometricLabel(support.label);
    });
  }, []);

  const handlePasswordUpdate = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(
        "Password too short",
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    setPasswordLoading(true);
    try {
      await userApi.updatePassword({ currentPassword, newPassword });
      await clearBiometricCredentials();
      Alert.alert(
        "Password updated",
        "Your password has been changed successfully.",
      );
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert(
        "Password update failed",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      Alert.alert(
        "Password required",
        "Enter your password to delete your account.",
      );
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteOpen(false);
      setDeletePassword("");
    } catch (err) {
      Alert.alert(
        "Could not delete account",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEnableLock = async () => {
    if (lockPin !== lockPinConfirm) {
      Alert.alert("PIN mismatch", "Both PIN fields must match.");
      return;
    }
    setLockBusy(true);
    try {
      await enableLock(lockPin);
      setLockPin("");
      setLockPinConfirm("");
      Alert.alert(
        "App lock on",
        "SusuFlow will ask for your PIN after you leave the app.",
      );
    } catch (err) {
      Alert.alert(
        "Could not enable lock",
        err instanceof Error ? err.message : "Try again.",
      );
    } finally {
      setLockBusy(false);
    }
  };

  const handleDisableLock = async () => {
    setLockBusy(true);
    try {
      await disableLock(disablePin);
      setDisablePin("");
      Alert.alert("App lock off", "PIN lock has been removed on this device.");
    } catch (err) {
      Alert.alert(
        "Could not disable lock",
        err instanceof Error ? err.message : "Try again.",
      );
    } finally {
      setLockBusy(false);
    }
  };

  return (
    <>
      <SettingsPanel>
        <SettingRow
          icon="lock-closed-outline"
          title="Password"
          subtitle="Update your sign-in password"
        />
        <SettingsDivider />
        <SettingRow
          icon="shield-checkmark-outline"
          title="App lock"
          subtitle={
            lockEnabled
              ? "PIN required when returning to SusuFlow"
              : "Protect balances when you leave the app"
          }
        />
      </SettingsPanel>

      {!lockEnabled ? (
        <View style={styles.stack}>
          <Input
            label={`New app PIN (${APP_LOCK_PIN_MIN}-${APP_LOCK_PIN_MAX} digits)`}
            value={lockPin}
            onChangeText={(v) =>
              setLockPin(v.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX))
            }
            keyboardType="number-pad"
            secureTextEntry
          />
          <Input
            label="Confirm PIN"
            value={lockPinConfirm}
            onChangeText={(v) =>
              setLockPinConfirm(v.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX))
            }
            keyboardType="number-pad"
            secureTextEntry
          />
          <Button
            title="Enable app lock"
            loading={lockBusy}
            onPress={() => void handleEnableLock()}
          />
        </View>
      ) : (
        <View style={styles.stack}>
          <SettingRow
            icon="finger-print-outline"
            title="Unlock with biometrics"
            subtitle={`Use ${biometricLabel} instead of typing your PIN`}
            right={
              <Switch
                value={biometricUnlock}
                onValueChange={(next) => void setBiometricUnlock(next)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor={colors.border}
              />
            }
          />
          <Input
            label="Current PIN to disable"
            value={disablePin}
            onChangeText={(v) =>
              setDisablePin(v.replace(/\D/g, "").slice(0, APP_LOCK_PIN_MAX))
            }
            keyboardType="number-pad"
            secureTextEntry
          />
          <Button
            title="Disable app lock"
            variant="outline"
            loading={lockBusy}
            onPress={() => void handleDisableLock()}
          />
        </View>
      )}

      <View style={styles.stack}>
        <Input
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Input
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button
          title="Update password"
          variant="outline"
          loading={passwordLoading}
          onPress={handlePasswordUpdate}
        />
      </View>

      <View
        style={[
          styles.dangerCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.dangerTitle, { color: colors.destructive }]}>
          Delete account
        </Text>
        <Text style={[styles.dangerCopy, { color: colors.mutedForeground }]}>
          Permanently remove your SusuFlow account and sign out on this device.
          This cannot be undone.
        </Text>
        <Input
          label="Password to confirm deletion"
          value={deletePassword}
          onChangeText={setDeletePassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button
          title="Delete my account"
          variant="outline"
          onPress={() => setDeleteOpen(true)}
          style={{ borderColor: colors.destructive }}
        />
      </View>

      <ConfirmDialog
        visible={deleteOpen}
        message="This permanently deletes your account and cannot be undone. Continue?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  dangerCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dangerTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
  },
  dangerCopy: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
