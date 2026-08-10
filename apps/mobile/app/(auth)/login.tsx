import { useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { DarkAuthField } from "@/components/auth/DarkAuthField";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    clearError();
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const trimmedEmail = email.trim();
      const explicitTenant = tenant.trim();
      await login(trimmedEmail, password, explicitTenant);
      setSuccessMessage("You are logged in successfully");
    } catch (err) {
      if (err instanceof ApiError && err.code === "VERIFICATION_REQUIRED") {
        const userId = err.details?.userId;
        router.push({
          pathname: "/(auth)/verify",
          params: {
            userId: typeof userId === "string" ? userId : "",
            tenant: tenant.trim(),
            email: email.trim(),
          },
        });
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isLoading;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <View style={styles.nav}>
            <BackArrowButton
              onPress={() => router.replace("/(auth)/welcome")}
              color={authChrome.ink}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/register-intro")}
              hitSlop={8}
            >
              <Text style={styles.navLink}>Sign Up</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            Let&apos;s get you back into your susu savings.
          </Text>

          <View style={styles.form}>
            <DarkAuthField
              label="Susu company"
              placeholder="Company name"
              value={tenant}
              onChangeText={setTenant}
              autoCapitalize="none"
              autoComplete="off"
            />
            <DarkAuthField
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <DarkAuthField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secure
              autoComplete="password"
              textContentType="password"
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/forgot-password")}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>Forgot your password?</Text>
            </Pressable>

            {successMessage ? (
              <AuthMessage message={successMessage} variant="success" />
            ) : null}
            {error ? <AuthMessage message={error} variant="error" /> : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            disabled={busy || !!successMessage}
            style={({ pressed }) => [
              styles.primaryBtn,
              (busy || !!successMessage) && styles.disabled,
              pressed && !busy && styles.primaryPressed,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={authChrome.onBlackLabel} />
            ) : (
              <Text style={styles.primaryLabel}>Log in</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authChrome.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 0,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  navLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: authChrome.linkOnDark,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: authChrome.ink,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: authChrome.inkMuted,
  },
  form: {
    gap: 14,
  },
  forgotWrap: {
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 4,
  },
  forgot: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: authChrome.linkOnDark,
  },
  primaryBtn: {
    marginTop: 22,
    minHeight: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    backgroundColor: authChrome.onBlackFill,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryPressed: {
    opacity: 0.88,
  },
  primaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.onBlackLabel,
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.55,
  },
});
