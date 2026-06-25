import { StyleSheet, Text, View } from "react-native";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function NotificationsSettingsContent() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.heading }]}>
        Notification preferences
      </Text>
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        Push, email, and SMS alerts are managed by your susu group administrator
        for now. In-app notification settings will be available in a future
        update.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  copy: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
});
