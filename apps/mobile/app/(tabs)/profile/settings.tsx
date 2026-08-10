import { useRouter } from "expo-router";
import { Text, StyleSheet, View } from "react-native";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { useThemeStore } from "@/stores/theme.store";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

function SectionLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {children}
    </Text>
  );
}

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { isDark } = useTheme();
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <SettingsDetailLayout
      title="Settings"
      subtitle="Manage how SusuFlow looks and keeps you secure"
    >
      <SectionLabel>Profile</SectionLabel>
      <View>
        <BankMenuRow
          item={{
            icon: "user",
            label: "Personal details",
            subtitle: "Name, phone, and contact info",
            onPress: () => router.push("/my-profile/personal"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "wallet",
            label: "Account overview",
            subtitle: "Membership and linked information",
            onPress: () => router.push("/my-profile/account"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "shield",
            label: "Identity verification",
            subtitle: "Ghana Card, passport, and selfie",
            onPress: () => router.push("/my-profile/kyc"),
          }}
          showDivider={false}
        />
      </View>

      <View style={[styles.sectionRule, { backgroundColor: divider }]} />

      <SectionLabel>Preferences</SectionLabel>
      <View>
        <BankMenuRow
          item={{
            icon: "moon",
            label: "Appearance",
            subtitle: colorScheme === "dark" ? "Dark theme" : "Light theme",
            onPress: () => router.push("/(tabs)/profile/appearance"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "bell",
            label: "Notifications",
            subtitle: "Push, email, and SMS alerts",
            onPress: () => router.push("/my-profile/notifications"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "smartphone",
            label: "Security",
            subtitle: "Password, biometrics, and app lock",
            onPress: () => router.push("/my-profile/security"),
          }}
          showDivider={false}
        />
      </View>
    </SettingsDetailLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: spacing.lg,
    marginBottom: 4,
  },
  sectionRule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
});
