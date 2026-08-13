import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { DarkAuthField } from "@/components/auth/DarkAuthField";
import { AvatarEditor } from "@/components/profile/AvatarEditor";
import { InkListRow, InkSection } from "@/components/settings/InkListRow";
import { useProfileData } from "@/components/settings/useProfileData";
import { userApi } from "@/lib/api";
import { authChrome } from "@/theme/auth-chrome";
import { toast } from "@/stores/toast.store";
import { spacing, typography } from "@/theme/tokens";

function maskClientId(value?: string) {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `${value.slice(0, 4)}${"*".repeat(Math.max(4, value.length - 4))}`;
}

/** Single screen: view + edit account / personal details. */
export function AccountSettingsContent() {
  const router = useRouter();
  const { profile, displayName, initials, email, avatarUrl, refetch } =
    useProfileData();
  const [clientVisible, setClientVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const clientCode = profile?.customer?.customerNumber ?? "—";
  const clientDisplay = clientVisible ? clientCode : maskClientId(clientCode);

  const updateMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        firstName: firstName.trim() || profile?.firstName,
        lastName: lastName.trim() || profile?.lastName,
        phone: phone.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Account details saved");
      refetch();
    },
    onError: (err: Error) => toast.error(err.message || "Update failed"),
  });

  return (
    <View style={styles.stack}>
      <View style={styles.identity}>
        <AvatarEditor
          initials={initials}
          displayName={displayName}
          imageUrl={avatarUrl}
          size="xxl"
          showActionLabel={false}
          badgeVariant="plus"
        />
        <Text style={styles.name} numberOfLines={2}>
          {displayName}
        </Text>
        {email ? (
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        ) : null}
      </View>

      <InkSection title="Personal details">
        <View style={styles.fields}>
          <DarkAuthField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <DarkAuthField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <DarkAuthField
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+233 XX XXX XXXX"
            autoCorrect={false}
          />

          <View style={styles.readOnlyBlock}>
            <Text style={styles.readOnlyLabel}>Email address</Text>
            <Text style={styles.readOnlyValue} numberOfLines={1}>
              {email || "Not set"}
            </Text>
            <Text style={styles.readOnlyHint}>
              Contact support to change the email on this account.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={updateMutation.isPending}
            onPress={() => updateMutation.mutate()}
            style={({ pressed }) => [
              styles.saveBtn,
              pressed && styles.savePressed,
              updateMutation.isPending && styles.saveDisabled,
            ]}
          >
            <Text style={styles.saveLabel}>
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Text>
          </Pressable>
        </View>
      </InkSection>

      <InkSection title="Account IDs">
        <InkListRow
          label="Client code"
          value={clientDisplay}
          trailingIcon={clientVisible ? "eye-off" : "eye"}
          onTrailingPress={() => setClientVisible((v) => !v)}
          showDivider={false}
        />
      </InkSection>

      <InkSection title="Security">
        <InkListRow
          label="Update Password"
          onPress={() => router.push("/my-profile/security-password" as Href)}
          accentChevron
        />
        <InkListRow
          label="Delete Account"
          onPress={() => router.push("/my-profile/security-delete" as Href)}
          destructive
          accentChevron
          showDivider={false}
        />
      </InkSection>

      <Text style={styles.hint}>
        Sensitive actions require your password or biometrics. Never share your
        client code or one-time codes.
      </Text>
    </View>
  );
}

/** @deprecated Use AccountSettingsContent — personal + account are one screen. */
export function PersonalSettingsContent() {
  return <AccountSettingsContent />;
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  identity: {
    alignItems: "center",
    gap: 6,
    paddingBottom: spacing.sm,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.35,
    color: authChrome.ink,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  email: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: authChrome.inkMuted,
    textAlign: "center",
  },
  fields: {
    gap: 16,
    paddingBottom: spacing.sm,
  },
  readOnlyBlock: {
    gap: 6,
    paddingVertical: 4,
  },
  readOnlyLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: authChrome.fieldLabel,
    marginLeft: 2,
  },
  readOnlyValue: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    color: authChrome.ink,
    backgroundColor: authChrome.field,
    borderRadius: authChrome.controlRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: "hidden",
  },
  readOnlyHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: authChrome.inkFaint,
    marginLeft: 2,
  },
  saveBtn: {
    marginTop: 4,
    minHeight: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    backgroundColor: authChrome.onBlackFill,
    alignItems: "center",
    justifyContent: "center",
  },
  savePressed: {
    opacity: 0.88,
  },
  saveDisabled: {
    opacity: 0.55,
  },
  saveLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.onBlackLabel,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: authChrome.inkFaint,
    marginTop: spacing.xs,
  },
});
