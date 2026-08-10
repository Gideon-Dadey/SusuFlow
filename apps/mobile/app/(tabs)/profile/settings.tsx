import { useRouter } from "expo-router";
import { Text, StyleSheet, View } from "react-native";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { useThemeStore } from "@/stores/theme.store";
import { getWellForIcon } from "@/theme/bankChrome";
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

/** Preferences hub — kept for deep links; primary entry is My Profile. */
export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { isDark } = useTheme();

  return (
    <SettingsDetailLayout
      title="Settings"
      subtitle="Display, alerts, and account security"
    >
      <SectionLabel>Preferences</SectionLabel>
      <View>
        <BankMenuRow
          item={{
            icon: "moon",
            label: "Appearance",
            subtitle: colorScheme === "dark" ? "Dark theme" : "Light theme",
            wellBg: getWellForIcon("moon", isDark).bg,
            wellFg: getWellForIcon("moon", isDark).fg,
            onPress: () => router.push("/my-profile/appearance"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "bell",
            label: "Notifications",
            subtitle: "Push, email, and SMS alerts",
            wellBg: getWellForIcon("bell", isDark).bg,
            wellFg: getWellForIcon("bell", isDark).fg,
            onPress: () => router.push("/my-profile/notifications"),
          }}
        />
        <BankMenuRow
          item={{
            icon: "smartphone",
            label: "Security",
            subtitle: "Password, biometrics, and app lock",
            wellBg: getWellForIcon("smartphone", isDark).bg,
            wellFg: getWellForIcon("smartphone", isDark).fg,
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
});
