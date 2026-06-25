import { CardSurface } from "@/components/ui/CardSurface";
import { StyleSheet, Text, View } from "react-native";
import { formatGoalStatus } from "@/components/goals/goalUtils";
import { formatGhs } from "@/lib/currency";
import type { CustomerPlanWithProgress } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface GoalProgressCardProps {
  enrollment: CustomerPlanWithProgress;
}

export function GoalProgressCard({ enrollment }: GoalProgressCardProps) {
  const { colors } = useTheme();
  const target = Number(enrollment.targetAmount || 0);
  const saved = Number(enrollment.savedAmount || 0);
  const progress = Math.min(100, Math.max(0, enrollment.progressPercent));
  const settled = enrollment.status === "completed";

  return (
    <CardSurface innerStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {enrollment.plan.name}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatGoalStatus(enrollment.status)}
          </Text>
        </View>
        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: settled ? colors.primary : colors.muted,
            },
          ]}
        >
          <Text
            style={[
              styles.percentText,
              { color: settled ? colors.primaryForeground : colors.foreground },
            ]}
          >
            {progress}%
          </Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.amounts}>
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>
            Saved
          </Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>
            {formatGhs(saved)}
          </Text>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>
            Target
          </Text>
          <Text style={[styles.amountValue, { color: colors.foreground }]}>
            {target > 0 ? formatGhs(target) : "—"}
          </Text>
        </View>
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  percentBadge: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignItems: "center",
  },
  percentText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  amounts: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountCol: {
    flex: 1,
    gap: 2,
  },
  amountLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  amountValue: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.15,
  },
  rule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    marginHorizontal: spacing.md,
  },
});
