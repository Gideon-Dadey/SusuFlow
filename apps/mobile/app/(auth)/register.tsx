import { useMemo, useState } from "react";
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
import { AppIcon } from "@/components/icons/AppIcon";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared/client";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { DarkAuthField } from "@/components/auth/DarkAuthField";
import {
  DarkGenderSelect,
  type GenderValue,
} from "@/components/auth/DarkGenderSelect";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { useAuthStore } from "@/stores/auth.store";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

const PASSWORD_RULES = [
  {
    id: "lower",
    label: "1 small letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "upper",
    label: "1 capital letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "1 number",
    test: (value: string) => /\d/.test(value),
  },
  {
    id: "special",
    label: "1 special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
  {
    id: "length",
    label: `${MIN_PASSWORD_LENGTH} characters`,
    test: (value: string) => value.length >= MIN_PASSWORD_LENGTH,
  },
] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [tenant, setTenant] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<GenderValue | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const ruleState = useMemo(
    () =>
      PASSWORD_RULES.map((rule) => ({
        ...rule,
        ok: rule.test(password),
      })),
    [password],
  );

  const passwordReady = ruleState.every((rule) => rule.ok);

  const handleRegister = async () => {
    clearError();
    setSuccessMessage("");
    setValidationError("");

    if (!gender) {
      setValidationError("Please select your gender");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setValidationError("Enter date of birth as YYYY-MM-DD");
      return;
    }
    const dob = new Date(dateOfBirth.trim());
    if (Number.isNaN(dob.getTime()) || dob >= new Date()) {
      setValidationError("Enter a valid date of birth");
      return;
    }
    if (!passwordReady) {
      setValidationError("Please meet all password requirements");
      return;
    }
    if (!agreed) {
      setValidationError("Please acknowledge the agreements to continue");
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
          dateOfBirth: dateOfBirth.trim(),
          gender,
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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
              onPress={() => router.replace("/(auth)/register-intro")}
              color={authChrome.ink}
            />
            <Text style={styles.navTitle}>Personal details</Text>
            <View style={styles.navSpacer} />
          </View>

          <Text style={styles.lead}>
            Ensure you enter your correct details. You won&apos;t be able to
            change this once you submit.
          </Text>

          <View style={styles.form}>
            <DarkAuthField
              placeholder="Official first name"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              textContentType="givenName"
            />
            <DarkAuthField
              placeholder="Official last name"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
              textContentType="familyName"
            />
            <DarkGenderSelect
              label="Gender"
              placeholder="Gender"
              value={gender}
              onChange={setGender}
            />
            <DarkAuthField
              label="Date of birth"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
            />
            <DarkAuthField
              label="Susu company"
              placeholder="Company name"
              value={tenant}
              onChangeText={setTenant}
              autoCapitalize="none"
              autoComplete="off"
            />
            <DarkAuthField
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
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
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <View style={styles.rules}>
              {ruleState.map((rule) => (
                <View key={rule.id} style={styles.ruleRow}>
                  <View
                    style={[
                      styles.ruleIcon,
                      rule.ok ? styles.ruleIconOk : styles.ruleIconBad,
                    ]}
                  >
                    <AppIcon
                      name={rule.ok ? "check" : "close"}
                      size={12}
                      color="#ffffff"
                      weight="bold"
                    />
                  </View>
                  <Text style={styles.ruleText}>{rule.label}</Text>
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              onPress={() => setAgreed((v) => !v)}
              style={styles.agreeRow}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                {agreed ? (
                  <AppIcon
                    name="check"
                    size={14}
                    color="#000000"
                    weight="bold"
                  />
                ) : null}
              </View>
              <Text style={styles.agreeText}>
                I acknowledge that I have read and agree to{" "}
                <Text style={styles.agreeLink}>SusuFlow&apos;s Agreements</Text>
              </Text>
            </Pressable>

            {successMessage ? (
              <AuthMessage message={successMessage} variant="success" />
            ) : null}
            {validationError ? (
              <AuthMessage message={validationError} variant="error" />
            ) : null}
            {error ? <AuthMessage message={error} variant="error" /> : null}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleRegister}
            disabled={isLoading || !!successMessage}
            style={({ pressed }) => [
              styles.primaryBtn,
              (isLoading || !!successMessage) && styles.disabled,
              pressed && !isLoading && styles.primaryPressed,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={authChrome.onBlackLabel} />
            ) : (
              <Text style={styles.primaryLabel}>Continue</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.switchWrap}
          >
            <Text style={styles.switchText}>
              Already have an account?{" "}
              <Text style={styles.switchLink}>Sign in</Text>
            </Text>
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
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  navTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    color: authChrome.ink,
  },
  navSpacer: {
    width: 44,
  },
  lead: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: authChrome.inkMuted,
    marginBottom: 22,
  },
  form: {
    gap: 12,
  },
  rules: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    rowGap: 10,
    marginTop: 4,
  },
  ruleRow: {
    width: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ruleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleIconBad: {
    backgroundColor: "#ef4444",
  },
  ruleIconOk: {
    backgroundColor: "#22c55e",
  },
  ruleText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: authChrome.inkMuted,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  agreeText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: authChrome.inkMuted,
  },
  agreeLink: {
    color: authChrome.ink,
    textDecorationLine: "underline",
  },
  primaryBtn: {
    marginTop: 28,
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
  switchWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  switchText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: authChrome.inkMuted,
  },
  switchLink: {
    fontFamily: typography.fontFamily.semibold,
    color: authChrome.ink,
  },
});
