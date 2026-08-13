import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "@/stores/toast.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function DeleteAccountContent() {
  const { colors } = useTheme();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!password.trim()) {
      toast.error("Enter your password to delete your account");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(password);
      setConfirmOpen(false);
      setPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete account",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.stack}>
      <View
        style={[
          styles.warning,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.warningTitle, { color: colors.destructive }]}>
          This cannot be undone
        </Text>
        <Text style={[styles.warningBody, { color: colors.mutedForeground }]}>
          Deleting closes your SusuFlow account on this device and removes your
          profile access. Outstanding balances and records follow your Susu
          company’s retention rules.
        </Text>
      </View>

      <Text style={[styles.lead, { color: colors.mutedForeground }]}>
        Enter your password to confirm it is you.
      </Text>

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
      />

      <Button
        title="Continue"
        variant="outline"
        disabled={!password.trim()}
        onPress={() => setConfirmOpen(true)}
        style={{ borderColor: colors.destructive }}
      />

      <ConfirmDialog
        visible={confirmOpen}
        message="Permanently delete your SusuFlow account? This cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        loading={deleting}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  warning: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 8,
  },
  warningTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
  },
  warningBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  lead: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
