import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SettingRow } from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { SettingsDivider } from "@/components/settings/SettingsGroup";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { userApi } from "@/lib/api";
import {
  clearBiometricCredentials,
  getBiometricSupport,
  hasBiometricCredentials,
} from "@/lib/biometric";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function SecuritySettingsContent() {
  const { colors } = useTheme();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const refreshBiometric = useCallback(async () => {
    const [support, enabled] = await Promise.all([
      getBiometricSupport(),
      hasBiometricCredentials(),
    ]);
    setBiometricLabel(support.label);
    setBiometricEnabled(enabled && support.available);
  }, []);

  useEffect(() => {
    void refreshBiometric();
  }, [refreshBiometric]);

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
      await refreshBiometric();
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

  const handleBiometricToggle = async (next: boolean) => {
    if (next) {
      Alert.alert(
        `Enable ${biometricLabel}`,
        "Sign in with your email and password on the login screen, then tap Enable when prompted.",
      );
      return;
    }

    await clearBiometricCredentials();
    await refreshBiometric();
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
          icon="finger-print-outline"
          title="Biometric sign-in"
          subtitle={
            biometricEnabled
              ? `${biometricLabel} is enabled on this device`
              : `Use ${biometricLabel} for quick sign-in`
          }
          right={
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
              ios_backgroundColor={colors.border}
            />
          }
        />
      </SettingsPanel>

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
