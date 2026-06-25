import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { authApi } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [tenant, setTenant] = useState(
    process.env.EXPO_PUBLIC_DEFAULT_TENANT || "",
  );
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim(), tenant.trim());
      setMessage(result.message);
      setStep("reset");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send reset code",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await authApi.resetPassword(
        { email: email.trim(), code: code.trim(), newPassword },
        tenant.trim(),
      );
      setMessage(result.message);
      setTimeout(() => router.replace("/(auth)/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <BackArrowButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.heading }]}>
          Reset password
        </Text>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          {step === "request"
            ? "Enter your email and susu company. We will send a reset code."
            : "Enter the code from your email and choose a new password."}
        </Text>

        {message ? <AuthMessage message={message} variant="success" /> : null}
        {error ? <AuthMessage message={error} variant="error" /> : null}

        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Susu company"
          value={tenant}
          onChangeText={setTenant}
          autoCapitalize="none"
        />

        {step === "reset" ? (
          <>
            <Input
              label="Reset code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <Input
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <Button
              title="Reset password"
              onPress={resetPassword}
              loading={loading}
            />
          </>
        ) : (
          <Button
            title="Send reset code"
            onPress={requestCode}
            loading={loading}
          />
        )}
      </ScrollView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    marginTop: spacing.md,
  },
  lead: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
