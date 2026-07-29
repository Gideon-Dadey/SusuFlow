import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { authApi } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

type Channel = "email" | "phone";

export default function VerifyAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    userId?: string;
    tenant?: string;
    email?: string;
  }>();

  const userId = params.userId ?? "";
  const tenant = params.tenant ?? process.env.EXPO_PUBLIC_DEFAULT_TENANT ?? "";
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshStatus = useCallback(async () => {
    if (!userId || !tenant) return;
    const status = await authApi.verificationStatus(userId, tenant);
    setEmailVerified(status.emailVerified);
    setPhoneVerified(status.phoneVerified);
    if (status.status === "active") {
      router.replace("/(auth)/login");
    }
  }, [router, tenant, userId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const sendCode = async (channel: Channel) => {
    if (!userId) return;
    setError("");
    setLoading(true);
    try {
      const result = await authApi.sendOtp(userId, channel, tenant);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (channel: Channel) => {
    if (!userId) return;
    const code = channel === "email" ? emailCode : phoneCode;
    setError("");
    setLoading(true);
    try {
      const result = await authApi.verifyOtp(
        { userId, channel, code: code.trim() },
        tenant,
      );
      setMessage(result.message);
      await refreshStatus();
      if (result.accountActive) {
        setTimeout(() => router.replace("/(auth)/login"), 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <AuthScreenShell>
        <View style={[styles.center, { paddingTop: insets.top + 40 }]}>
          <Text style={{ color: colors.foreground }}>
            Invalid verification link.
          </Text>
          <Button
            title="Back to login"
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>
      </AuthScreenShell>
    );
  }

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
          Verify your account
        </Text>
        <Text style={[styles.lead, { color: colors.mutedForeground }]}>
          Enter the codes sent to your email and phone to activate your Credo
          account.
        </Text>

        {message ? <AuthMessage message={message} variant="success" /> : null}
        {error ? <AuthMessage message={error} variant="error" /> : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Email {emailVerified ? "✓" : ""}
          </Text>
          <Input
            label="Email code"
            value={emailCode}
            onChangeText={setEmailCode}
            keyboardType="number-pad"
            editable={!emailVerified}
          />
          <View style={styles.row}>
            <Button
              title="Resend"
              variant="outline"
              onPress={() => sendCode("email")}
              disabled={loading || emailVerified}
            />
            <Button
              title="Verify email"
              onPress={() => verify("email")}
              loading={loading}
              disabled={emailVerified}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Phone {phoneVerified ? "✓" : ""}
          </Text>
          <Input
            label="SMS code"
            value={phoneCode}
            onChangeText={setPhoneCode}
            keyboardType="number-pad"
            editable={!phoneVerified}
          />
          <View style={styles.row}>
            <Button
              title="Resend"
              variant="outline"
              onPress={() => sendCode("phone")}
              disabled={loading || phoneVerified}
            />
            <Button
              title="Verify phone"
              onPress={() => verify("phone")}
              loading={loading}
              disabled={phoneVerified}
            />
          </View>
        </View>

        <Pressable onPress={() => router.replace("/(auth)/login")}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Back to sign in
          </Text>
        </Pressable>
      </ScrollView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  link: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
