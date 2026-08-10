import { StyleSheet, Text, View } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

/** Thin banner when the device is offline — kept non-blocking. */
export function OfflineBanner() {
  const { colors, isDark } = useTheme();
  const { isOnline, checked } = useNetworkStatus();

  if (!checked || isOnline) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "#FFFBEB",
          borderColor: isDark ? "rgba(245,158,11,0.35)" : "#FDE68A",
        },
      ]}
      accessibilityRole="alert"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        You’re offline
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        Showing the last saved data. Deposits and withdrawals need a connection.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
});
