import { AppIcon } from "@/components/icons/AppIcon";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface GoalsEmptyStateProps {
  variant: "active" | "catalog";
}

export function GoalsEmptyState({ variant }: GoalsEmptyStateProps) {
  const { colors } = useTheme();

  const copy =
    variant === "active"
      ? {
          title: "No active goals yet",
          body: "Join a savings plan below to start tracking progress toward your target.",
        }
      : {
          title: "No plans available",
          body: "Your susu administrator has not published savings goals yet. Check back soon.",
        };

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <AppIcon name="target" size={20} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {copy.title}
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {copy.body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});
