import { useState, type ReactNode } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import { Input } from "@/components/Input";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { brandGreen, radius, spacing, typography } from "@/theme/tokens";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [tenant, setTenant] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleRegister = async () => {
    clearError();
    setSuccessMessage("");
    setValidationError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      );
      return;
    }

    try {
      const result = await register(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        },
        tenant.trim(),
      );
      setSuccessMessage(
        result.message || "Account created. Verify your email and phone next.",
      );
      setTimeout(
        () =>
          router.replace({
            pathname: "/(auth)/verify",
            params: {
              userId: result.userId,
              tenant: tenant.trim(),
              email: email.trim(),
            },
          }),
        1200,
      );
    } catch {
      // error in store
    }
  };

  const heroGradient = ["#1a365d", "#152a4a", "#12243f"] as const;

  const heroTextColor = isDark ? colors.foreground : "#ffffff";

  const shell = (children: ReactNode) =>
    isDark ? (
      <AuthScreenShell>{children}</AuthScreenShell>
    ) : (
      <View style={[styles.root, { backgroundColor: colors.splashBackground }]}>
        <LinearGradient colors={heroGradient} style={StyleSheet.absoluteFill} />
        {children}
      </View>
    );

  return (
    <>
      <StatusBar style="light" />
      {shell(
        <>
          <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
            <BackArrowButton
              onPress={() => router.replace("/(auth)/register-intro")}
              color={heroTextColor}
            />

            <View style={styles.progressRow}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor: isDark
                        ? colors.primary
                        : "rgba(255,255,255,0.35)",
                      opacity: isDark ? 0.4 : 1,
                    },
                  ]}
                />
              ))}
              <View
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: isDark ? colors.primary : "#ffffff",
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.heroIcon,
                {
                  borderColor: isDark
                    ? colors.border
                    : "rgba(255,255,255,0.35)",
                },
              ]}
            >
              <Ionicons name="person-outline" size={42} color={heroTextColor} />
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.sheetWrap}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.card,
                  borderTopColor: colors.border,
                  borderTopWidth: isDark ? 1 : 0,
                  ...(isDark ? { shadowOpacity: 0, elevation: 0 } : {}),
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
                contentContainerStyle={[
                  styles.sheetContent,
                  { paddingBottom: insets.bottom + spacing.xxl },
                ]}
              >
                <Text
                  style={[styles.instruction, { color: colors.foreground }]}
                >
                  Enter your legal name and active contact details to join your
                  susu group
                </Text>

                <View style={styles.form}>
                  <Input
                    label="Susu company"
                    placeholder="e.g. adipa"
                    value={tenant}
                    onChangeText={setTenant}
                    autoCapitalize="none"
                    autoComplete="off"
                  />

                  <View style={styles.nameRow}>
                    <View style={styles.nameField}>
                      <Input
                        label="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoComplete="given-name"
                        textContentType="givenName"
                      />
                    </View>
                    <View style={styles.nameField}>
                      <Input
                        label="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoComplete="family-name"
                        textContentType="familyName"
                      />
                    </View>
                  </View>

                  <Input
                    label="Email address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                  <Input
                    label="Phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                  />
                  <AuthPasswordInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="new-password"
                  />

                  {successMessage ? (
                    <AuthMessage message={successMessage} variant="success" />
                  ) : null}
                  {validationError ? (
                    <AuthMessage message={validationError} variant="error" />
                  ) : null}
                  {error ? (
                    <AuthMessage message={error} variant="error" />
                  ) : null}
                </View>

                <View style={styles.switchRow}>
                  <Text
                    style={[
                      styles.switchText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Already have an account?
                  </Text>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => router.replace("/(auth)/login")}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.switchLink,
                        { color: isDark ? colors.primary : colors.primary700 },
                      ]}
                    >
                      Sign in
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.replace("/(auth)/welcome")}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.cancelButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.primary,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[styles.cancelLabel, { color: colors.primary }]}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleRegister}
                    disabled={isLoading || !!successMessage}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.nextButton,
                      (isLoading || !!successMessage) && styles.disabled,
                      pressed && !isLoading && styles.pressed,
                    ]}
                  >
                    <Text style={styles.nextLabel}>
                      {isLoading ? "Creating..." : "Create account"}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </>,
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.md,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  heroIcon: {
    alignSelf: "center",
    marginTop: spacing.xl,
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetWrap: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -8,
    shadowColor: "#020617",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  instruction: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  switchText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
  },
  switchLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  nextButton: {
    backgroundColor: "#0056d2",
    shadowColor: "#0056d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  nextLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});
