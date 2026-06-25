import { AppIcon } from "@/components/icons/AppIcon";
import { StyleSheet, Text, View } from "react-native";
import { CardSurface } from "@/components/ui/CardSurface";
import type { ActivityFilter } from "@/components/activity/transactionUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface ActivityEmptyStateProps {
  filter: ActivityFilter;
}

export function ActivityEmptyState({ filter }: ActivityEmptyStateProps) {
  const { colors } = useTheme();

  const copy =
    filter === "all"
      ? {
          title: "No activity yet",
          body: "Deposits and withdrawals will appear here once you start saving.",
        }
      : filter === "deposit"
        ? {
            title: "No deposits",
            body: "Your deposit history will show up here.",
          }
        : {
            title: "No withdrawals",
            body: "Withdrawals from your account will appear here.",
          };

  return (
    <CardSurface innerStyle={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
        <AppIcon name="receipt" size={22} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {copy.title}
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {copy.body}
      </Text>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
});
