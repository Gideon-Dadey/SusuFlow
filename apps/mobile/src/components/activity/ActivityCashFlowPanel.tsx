import { StyleSheet, Text, View } from "react-native";
import { HomeSparkline } from "@/components/home/HomeSparkline";
import { formatGhs } from "@/lib/currency";
import type { ActivityPeriodInsights } from "@/components/activity/transactionUtils";
import { ACTIVITY_PERIOD_LABELS } from "@/components/activity/transactionUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { CardSurface } from "@/components/ui/CardSurface";
import { radius, spacing, typography } from "@/theme/tokens";

interface ActivityCashFlowPanelProps {
  insights: ActivityPeriodInsights;
}

function formatDelta(delta: number | null): string | null {
  if (delta === null || Number.isNaN(delta)) return null;
  const rounded = Math.round(delta);
  if (rounded === 0) return "Flat vs prior period";
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}% vs prior period`;
}

export function ActivityCashFlowPanel({
  insights,
}: ActivityCashFlowPanelProps) {
  const { colors } = useTheme();
  const deltaLabel = formatDelta(insights.periodDeltaPct);
  const deltaPositive =
    insights.periodDeltaPct !== null && insights.periodDeltaPct >= 0;

  return (
    <CardSurface innerStyle={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Cash flow · {ACTIVITY_PERIOD_LABELS[insights.period]}
          </Text>
          <Text style={[styles.netFlow, { color: colors.foreground }]}>
            {formatGhs(insights.netFlow)}
          </Text>
          {deltaLabel && insights.period !== "all_time" ? (
            <Text
              style={[
                styles.delta,
                {
                  color: deltaPositive ? colors.primary : colors.destructive,
                },
              ]}
            >
              {deltaLabel}
            </Text>
          ) : (
            <Text
              style={[styles.deltaMuted, { color: colors.mutedForeground }]}
            >
              {insights.transactionCount} transaction
              {insights.transactionCount === 1 ? "" : "s"} in scope
            </Text>
          )}
        </View>

        {insights.sparklineValues.length > 1 ? (
          <HomeSparkline
            width={112}
            height={58}
            values={insights.sparklineValues}
          />
        ) : null}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.grid}>
        <Metric
          label="Money in"
          value={formatGhs(insights.moneyIn)}
          valueColor={colors.primary}
        />
        <Metric
          label="Money out"
          value={formatGhs(insights.moneyOut)}
          valueColor={colors.foreground}
        />
        <Metric
          label="Success rate"
          value={
            insights.successRate !== null ? `${insights.successRate}%` : "—"
          }
          valueColor={colors.foreground}
        />
        <Metric
          label="Avg deposit"
          value={
            insights.averageDeposit !== null
              ? formatGhs(insights.averageDeposit)
              : "—"
          }
          valueColor={colors.foreground}
        />
      </View>
    </CardSurface>
  );
}

function Metric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    letterSpacing: 0.2,
  },
  netFlow: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.xxl,
    letterSpacing: -0.6,
  },
  delta: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  deltaMuted: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.md,
  },
  metric: {
    width: "50%",
    gap: 4,
    paddingRight: spacing.sm,
  },
  metricLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  metricValue: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.15,
  },
});
