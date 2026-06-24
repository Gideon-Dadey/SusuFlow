import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/stores/auth.store";
import { colors, radius, spacing, typography } from "@/theme/tokens";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState(
    process.env.EXPO_PUBLIC_DEFAULT_TENANT || "",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    clearError();
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password, tenant.trim());
      setSuccessMessage("You are logged in successfully");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 24 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <View style={styles.logoBar} />
          <View style={[styles.logoBar, styles.logoBarMid]} />
          <View style={styles.logoBar} />
        </View>
        <View>
          <Text style={styles.brand}>SusuFlow</Text>
          <Text style={styles.brandSub}>GHANA</Text>
        </View>
      </View>

      <Text style={styles.heading}>Sign in</Text>
      <Text style={styles.subheading}>Save together. Grow together.</Text>

      <View style={styles.form}>
        <Input
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="Your password"
        />
        <Input
          label="Susu company (tenant)"
          value={tenant}
          onChangeText={setTenant}
          autoCapitalize="none"
          placeholder="apex-susu"
        />

        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Sign in"
          loading={isSubmitting || isLoading}
          onPress={handleLogin}
          disabled={!!successMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing.xxl,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 8,
  },
  logoBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primaryForeground,
  },
  logoBarMid: {
    width: 14,
    opacity: 0.85,
  },
  brand: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: colors.heading,
  },
  brandSub: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    color: colors.mutedForeground,
    letterSpacing: 1.2,
  },
  heading: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xxl,
    color: colors.heading,
  },
  subheading: {
    marginTop: 6,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.mutedForeground,
  },
  form: {
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  error: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.destructive,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: radius.md,
  },
  success: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: colors.primary700,
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: radius.md,
  },
});
