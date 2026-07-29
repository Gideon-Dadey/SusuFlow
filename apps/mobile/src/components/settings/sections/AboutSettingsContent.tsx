import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BrandMark } from "@/components/profile/BrandMark";
import { appVersion, SettingRow } from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { SettingsDivider } from "@/components/settings/SettingsGroup";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

export function AboutSettingsContent() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <>
      <View
        style={[
          styles.brandCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <BrandMark size={64} />
        <Text style={[styles.brandName, { color: colors.heading }]}>Credo</Text>
        <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
          Save together. Grow together.
        </Text>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          Version {appVersion}
        </Text>
      </View>

      <SettingsPanel>
        <SettingRow
          icon="flag-outline"
          title="Built for Ghana"
          subtitle="Digital susu for modern communities"
        />
        <SettingsDivider />
        <SettingRow
          icon="shield-outline"
          title="Regulated & secure"
          subtitle="Your savings protected by industry standards"
        />
        <SettingsDivider />
        <SettingRow
          icon="document-text-outline"
          title="Terms of service"
          subtitle="Read our terms and policies"
          onPress={() => router.push("/(tabs)/profile/terms")}
        />
        <SettingsDivider />
        <SettingRow
          icon="lock-closed-outline"
          title="Privacy policy"
          subtitle="How we handle your data"
          onPress={() => router.push("/(tabs)/profile/privacy")}
        />
      </SettingsPanel>
    </>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  brandName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
  },
  version: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    marginTop: 4,
  },
});
