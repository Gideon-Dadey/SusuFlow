import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
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
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { AuthIconInput } from "@/components/auth/AuthIconInput";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { BiometricLoginButton } from "@/components/auth/BiometricLoginButton";
import { SegmentedTabs } from "@/components/auth/SegmentedTabs";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { ApiError } from "@/lib/api";
import {
  getBiometricSupport,
  hasBiometricCredentials,
  isBiometricLoginReady,
  loadBiometricSession,
  updateBiometricSession,
  type BiometricSupport,
} from "@/lib/biometric";
import { useAuthStore } from "@/stores/auth.store";
import { useBiometricStore } from "@/stores/biometric.store";
import { useTheme } from "@/theme/ThemeProvider";
import { brandGreen, radius, spacing, typography } from "@/theme/tokens";

type LoginTab = "email" | "company";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { login, loginWithRefreshToken, isLoading, error, clearError } =
    useAuthStore();
  const [tab, setTab] = useState<LoginTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState(
    process.env.EXPO_PUBLIC_DEFAULT_TENANT || "",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [biometricSupport, setBiometricSupport] =
    useState<BiometricSupport | null>(null);
  const [biometricReady, setBiometricReady] = useState(false);
  const autoBiometricAttempted = useRef(false);
  const queueEnrollment = useBiometricStore((s) => s.queueEnrollment);

  const refreshBiometricState = useCallback(async () => {
    const support = await getBiometricSupport();
    const ready = await isBiometricLoginReady();
    setBiometricSupport(support);
    setBiometricReady(ready);
    return { support, ready };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      const { ready } = await refreshBiometricState();
      if (cancelled || autoBiometricAttempted.current || !ready) return;

      autoBiometricAttempted.current = true;
      timer = setTimeout(() => {
        if (!cancelled) void handleBiometricLoginRef.current();
      }, 350);
    })();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshBiometricState();
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, [refreshBiometricState]);

  const handleBiometricLoginRef = useRef<() => Promise<void>>(async () => {});

  const handleBiometricLogin = useCallback(async () => {
    clearError();
    setSuccessMessage("");

    const support = await getBiometricSupport();
    setBiometricSupport(support);

    if (!support.available) {
      Alert.alert(
        "Biometrics unavailable",
        Platform.OS === "ios"
          ? "Set up Face ID or Touch ID in your device settings to use this feature."
          : "Set up fingerprint or face unlock in your device settings to use this feature.",
      );
      return;
    }

    const saved = await hasBiometricCredentials();
    if (!saved) {
      setBiometricReady(false);
      Alert.alert(
        `${support.label} not set up`,
        `Sign in with your email and password once, then tap Enable when prompted to use ${support.label}.`,
      );
      return;
    }

    setIsBiometricLoading(true);
    try {
      const session = await loadBiometricSession(support.label);
      if (!session) {
        setBiometricReady(false);
        return;
      }

      setEmail(session.email);
      setTenant(session.tenant);
      await loginWithRefreshToken(
        session.refreshToken,
        session.tenant,
        session.email,
      );
      setSuccessMessage("You are logged in successfully");
    } catch {
      // error shown via store
    } finally {
      setIsBiometricLoading(false);
    }
  }, [clearError, loginWithRefreshToken]);

  useEffect(() => {
    handleBiometricLoginRef.current = handleBiometricLogin;
  }, [handleBiometricLogin]);

  const handleLogin = async () => {
    clearError();
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedTenant = tenant.trim();
      const data = await login(trimmedEmail, password, trimmedTenant);
      setSuccessMessage("You are logged in successfully");

      const alreadySaved = await hasBiometricCredentials();
      if (!alreadySaved) {
        const support = await getBiometricSupport();
        if (support.available) {
          queueEnrollment({
            email: trimmedEmail,
            tenant: trimmedTenant,
            refreshToken: data.refreshToken,
          });
        }
      } else {
        await updateBiometricSession({
          email: trimmedEmail,
          tenant: trimmedTenant,
          refreshToken: data.refreshToken,
        });
      }
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
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isLoading;
  const bioBusy = isBiometricLoading;
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
            <View style={styles.heroNav}>
              <BackArrowButton
                onPress={() => router.replace("/(auth)/welcome")}
                color={heroTextColor}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/(auth)/register-intro")}
                hitSlop={8}
              >
                <Text style={[styles.registerLink, { color: heroTextColor }]}>
                  Register
                </Text>
              </Pressable>
            </View>

            <View style={styles.brandBlock}>
              <Image
                source={BRAND_LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.wordmark, { color: heroTextColor }]}>
                Credo
              </Text>
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.sheetWrap}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.card,
                  borderTopColor: colors.border,
                  borderTopWidth: isDark ? 1 : 0,
                  ...(isDark
                    ? {
                        shadowOpacity: 0,
                        elevation: 0,
                      }
                    : {}),
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={[
                  styles.sheetContent,
                  { paddingBottom: insets.bottom + 24 },
                ]}
              >
                <Text
                  style={[styles.sheetLead, { color: colors.mutedForeground }]}
                >
                  Please log in to continue
                </Text>

                <SegmentedTabs
                  options={[
                    { value: "email", label: "Email" },
                    { value: "company", label: "Susu" },
                  ]}
                  value={tab}
                  onChange={setTab}
                />

                <View style={styles.form}>
                  {tab === "company" ? (
                    <AuthIconInput
                      label="Susu company"
                      icon="business-outline"
                      value={tenant}
                      onChangeText={setTenant}
                      autoCapitalize="none"
                      autoComplete="off"
                    />
                  ) : null}

                  <AuthIconInput
                    label="Email address"
                    icon="mail-outline"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                  <AuthIconInput
                    label="Password"
                    icon="lock-closed-outline"
                    value={password}
                    onChangeText={setPassword}
                    secure
                    autoComplete="password"
                  />

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/(auth)/forgot-password")}
                    style={styles.forgotWrap}
                  >
                    <Text
                      style={[styles.forgotText, { color: colors.primary }]}
                    >
                      Reset password
                    </Text>
                  </Pressable>

                  {successMessage ? (
                    <AuthMessage message={successMessage} variant="success" />
                  ) : null}
                  {error ? (
                    <AuthMessage message={error} variant="error" />
                  ) : null}
                </View>

                {biometricSupport?.available ? (
                  <Text
                    style={[styles.bioHint, { color: colors.mutedForeground }]}
                  >
                    {biometricReady
                      ? `Or sign in with ${biometricSupport.label}`
                      : `Sign in once to enable ${biometricSupport.label}`}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleLogin}
                    disabled={busy || bioBusy || !!successMessage}
                    style={({ pressed }) => [
                      styles.loginButton,
                      (busy || bioBusy || !!successMessage) &&
                        styles.loginDisabled,
                      pressed && !busy && !bioBusy && styles.pressed,
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.loginLabel}>SIGN IN</Text>
                    )}
                  </Pressable>
                  <BiometricLoginButton
                    support={biometricSupport}
                    enabled={!!biometricSupport?.available}
                    ready={biometricReady}
                    loading={bioBusy}
                    onPress={handleBiometricLogin}
                  />
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
    minHeight: 220,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  registerLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    letterSpacing: 0.2,
  },
  brandBlock: {
    alignItems: "center",
    marginTop: spacing.lg,
    gap: 10,
  },
  logo: {
    width: 72,
    height: 72,
  },
  wordmark: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 30,
    letterSpacing: -0.4,
  },
  sheetWrap: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  sheetLead: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  form: {
    gap: spacing.lg,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  bioHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    textAlign: "center",
    marginTop: -8,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  loginButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: brandGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  loginDisabled: {
    opacity: 0.65,
  },
  loginLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: "#ffffff",
    letterSpacing: 1.2,
  },
  pressed: {
    opacity: 0.9,
  },
});
