import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { userApi } from "@/lib/api";
import { clearBiometricCredentials } from "@/lib/biometric";
import { toast } from "@/stores/toast.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export function ChangePasswordContent() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const lengthOk = newPassword.length >= MIN_PASSWORD_LENGTH;
  const matchOk = confirmPassword.length > 0 && newPassword === confirmPassword;
  const differentOk = newPassword.length > 0 && newPassword !== currentPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    lengthOk &&
    matchOk &&
    differentOk &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await userApi.updatePassword({ currentPassword, newPassword });
      await clearBiometricCredentials();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
      router.back();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stack}>
      <Input
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
      />
      <Input
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Input
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View style={styles.checklist}>
        <CheckItem
          ok={lengthOk}
          label={`At least ${MIN_PASSWORD_LENGTH} characters`}
        />
        <CheckItem ok={differentOk} label="Different from current password" />
        <CheckItem ok={matchOk} label="New passwords match" />
      </View>

      <Button
        title="Update password"
        loading={loading}
        disabled={!canSubmit}
        onPress={() => void handleSubmit()}
      />
    </View>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.check,
        { color: ok ? colors.success : colors.mutedForeground },
      ]}
    >
      {ok ? "✓" : "○"} {label}
    </Text>
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
  checklist: {
    gap: 6,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  check: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
