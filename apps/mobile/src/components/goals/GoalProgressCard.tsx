import { StyleSheet, Text, View } from "react-native";
import { formatGoalStatus } from "@/components/goals/goalUtils";
import { formatGhs } from "@/lib/currency";
import type { CustomerPlanWithProgress } from "@/lib/api";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface GoalProgressCardProps {
  enrollment: CustomerPlanWithProgress;
  showDivider?: boolean;
}

/** Active goal progress — flat list item, same chrome as More. */
export function GoalProgressCard({
  enrollment,
  showDivider = true,
}: GoalProgressCardProps) {
  const { colors, isDark } = useTheme();
  const target = Number(enrollment.targetAmount || 0);
  const saved = Number(enrollment.savedAmount || 0);
  const progress = Math.min(100, Math.max(0, enrollment.progressPercent));
  const settled = enrollment.status === "completed";
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.header}>
          <View style={styles.copy}>
            <Text
              style={[styles.title, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {enrollment.plan.name}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatGoalStatus(enrollment.status)} · {formatGhs(saved)}
              {target > 0 ? ` of ${formatGhs(target)}` : ""}
            </Text>
          </View>
          <Text
            style={[
              styles.percent,
              {
                color: settled ? colors.success : colors.foreground,
              },
            ]}
          >
            {progress}%
          </Text>
        </View>

        <View
          style={[
            styles.track,
            { backgroundColor: isDark ? "#1A1A1A" : colors.muted },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${progress}%`,
                backgroundColor: settled ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
      </View>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: divider }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: bankChrome.rowPaddingX,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.15,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  percent: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.2,
    marginTop: 2,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankChrome.rowPaddingX,
  },
});
