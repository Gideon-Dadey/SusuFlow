import { AppIcon } from "@/components/icons/AppIcon";
import { TenantBrandMark } from "@/components/branding/TenantBrandMark";
import {
  BALANCE_PERIOD_GROWTH_HINT,
  BALANCE_PERIOD_LABELS,
  buildPeriodSparklineValues,
  computePeriodGrowth,
  hasSavingsSparklineData,
  type BalancePeriod,
} from "@/components/home/homeUtils";
import { homeChrome } from "@/components/home/homeChrome";
import { HomeSparkline } from "@/components/home/HomeSparkline";
import type { Transaction } from "@/lib/api";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { CardSurface } from "@/components/ui/CardSurface";
import { radius, spacing, typography } from "@/theme/tokens";

const PERIOD_OPTIONS: BalancePeriod[] = ["this_month", "last_month"];

interface HomeBalanceCardProps {
  balance: number;
  groupName: string;
  logoUrl?: string | null;
  transactions?: Transaction[];
}

export function HomeBalanceCard({
  balance,
  groupName,
  logoUrl,
  transactions = [],
}: HomeBalanceCardProps) {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(true);
  const [period, setPeriod] = useState<BalancePeriod>("this_month");
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);

  const growthPercent = useMemo(
    () => computePeriodGrowth(transactions, period),
    [transactions, period],
  );

  const sparklineValues = useMemo(
    () => buildPeriodSparklineValues(transactions, period),
    [transactions, period],
  );

  const showSparkline = hasSavingsSparklineData(sparklineValues);

  const growthLabel =
    growthPercent === null
      ? null
      : `${growthPercent >= 0 ? "+" : "−"}${Math.abs(growthPercent).toFixed(1)}%`;

  const growthPositive = growthPercent !== null && growthPercent >= 0;

  const selectPeriod = (next: BalancePeriod) => {
    setPeriod(next);
    setPeriodMenuOpen(false);
  };

  return (
    <>
      <CardSurface innerStyle={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <Text
              style={[styles.accountName, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {groupName || "Savings"}
            </Text>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Available balance
              </Text>
              <Pressable
                onPress={() => setVisible((v) => !v)}
                hitSlop={12}
                accessibilityLabel={visible ? "Hide balance" : "Show balance"}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <AppIcon
                  name={visible ? "eye" : "eye-off"}
                  size={15}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select savings period"
            onPress={() => setPeriodMenuOpen(true)}
            style={({ pressed }) => [
              styles.periodPill,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(15, 23, 42, 0.04)",
              },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.periodText, { color: colors.mutedForeground }]}
            >
              {BALANCE_PERIOD_LABELS[period]}
            </Text>
            <AppIcon
              name="chevron-down"
              size={13}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <View style={styles.balanceRow}>
          <View style={styles.balanceBlock}>
            <Text style={[styles.amount, { color: colors.foreground }]}>
              {visible ? formatGhs(balance) : "••••••"}
            </Text>

            {growthLabel ? (
              <View style={styles.growthRow}>
                <View
                  style={[
                    styles.growthChip,
                    {
                      backgroundColor: growthPositive
                        ? isDark
                          ? homeChrome.growthDarkWell
                          : homeChrome.growthSoft
                        : isDark
                          ? "rgba(225, 29, 72, 0.16)"
                          : "#FFF1F2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.growthValue,
                      {
                        color: growthPositive
                          ? isDark
                            ? "#E2E8F0"
                            : homeChrome.growthInk
                          : colors.destructive,
                      },
                    ]}
                  >
                    {growthLabel}
                  </Text>
                </View>
                <Text
                  style={[styles.growthHint, { color: colors.mutedForeground }]}
                >
                  {BALANCE_PERIOD_GROWTH_HINT[period]}
                </Text>
              </View>
            ) : null}
          </View>

          {showSparkline ? <HomeSparkline values={sparklineValues} /> : null}
        </View>

        <View style={[styles.groupFooter, { borderTopColor: colors.border }]}>
          <TenantBrandMark logoUrl={logoUrl} size={28} />
          <Text
            style={[styles.groupValue, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            Your susu group
          </Text>
        </View>
      </CardSurface>

      <Modal
        visible={periodMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodMenuOpen(false)}
      >
        <View style={styles.menuBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setPeriodMenuOpen(false)}
            accessibilityLabel="Close period menu"
          />
          <View
            style={[
              styles.menuSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.menuTitle, { color: colors.mutedForeground }]}>
              Period
            </Text>
            {PERIOD_OPTIONS.map((option, index) => {
              const selected = period === option;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => selectPeriod(option)}
                  style={({ pressed }) => [
                    styles.menuOption,
                    index < PERIOD_OPTIONS.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.menuOptionText,
                      {
                        color: selected ? colors.foreground : colors.foreground,
                      },
                    ]}
                  >
                    {BALANCE_PERIOD_LABELS[option]}
                  </Text>
                  {selected ? (
                    <AppIcon
                      name="badge-check"
                      size={18}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 0,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  accountName: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.base,
    letterSpacing: -0.2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    letterSpacing: 0.2,
  },
  periodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  periodText: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  balanceBlock: {
    flex: 1,
    gap: 10,
  },
  amount: {
    fontFamily: typography.roles.display,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 38,
  },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  growthChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  growthValue: {
    fontFamily: typography.roles.label,
    fontSize: typography.size.xs,
    letterSpacing: -0.1,
  },
  growthHint: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  groupFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  groupValue: {
    flex: 1,
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  pressed: {
    opacity: 0.72,
  },
  menuBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  menuSheet: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  menuTitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    letterSpacing: 0.4,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    minHeight: 52,
  },
  menuOptionText: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.base,
  },
});
