import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AccountIdentityHero } from "@/components/profile/AccountIdentityHero";
import { AccountInfoField } from "@/components/profile/AccountInfoField";
import { useProfileData } from "@/components/settings/useProfileData";
import { useRouter } from "expo-router";
import { spacing, typography } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

function maskClientId(value?: string) {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `${value.slice(0, 4)}${"*".repeat(Math.max(4, value.length - 4))}`;
}

export function AccountSettingsContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, displayName, initials, email, phone } = useProfileData();
  const [clientVisible, setClientVisible] = useState(false);

  const clientCode = profile?.customer?.customerNumber ?? "—";
  const clientDisplay = clientVisible ? clientCode : maskClientId(clientCode);

  return (
    <View style={styles.stack}>
      <AccountIdentityHero
        initials={initials}
        displayName={displayName}
        email={email || undefined}
        clientId={clientDisplay}
        seed={displayName}
      />

      <AccountInfoField
        label="Unique Client Code"
        value={clientDisplay}
        trailingIcon={clientVisible ? "eye-off-outline" : "eye-outline"}
        onTrailingPress={() => setClientVisible((v) => !v)}
      />

      <AccountInfoField
        label="Registration number"
        value={email || "Not set"}
      />

      {phone ? <AccountInfoField label="Phone number" value={phone} /> : null}

      <AccountInfoField
        label="Change Password"
        onPress={() => router.push("/(tabs)/profile/security")}
        trailingIcon="pencil-outline"
      />

      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        To delete your account, open Security settings.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
