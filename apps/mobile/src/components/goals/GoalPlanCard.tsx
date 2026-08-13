import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatPlanAmountRange,
  formatPlanFrequency,
} from "@/components/goals/goalUtils";
import type { SavingsPlan } from "@/lib/api";
import { bankChrome, getBankWell } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

interface GoalPlanCardProps {
  plan: SavingsPlan;
  enrolled?: boolean;
  onPress: () => void;
  showDivider?: boolean;
}

/** Flat More-style row for available savings plans. */
export function GoalPlanCard({
  plan,
  enrolled,
  onPress,
  showDivider = true,
}: GoalPlanCardProps) {
  const { colors, isDark } = useTheme();
  const well = getBankWell("orange", isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  const subtitle = [
    formatPlanFrequency(plan.frequency),
    formatPlanAmountRange(plan),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={enrolled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { opacity: enrolled ? 0.72 : 1 },
          pressed && !enrolled && styles.pressed,
        ]}
      >
        <View style={[styles.well, { backgroundColor: well.bg }]}>
          <AppIcon name="target" size={17} color={well.fg} strokeWidth={2} />
        </View>

        <View style={styles.copy}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {plan.name}
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {plan.description?.trim() || subtitle}
          </Text>
          {plan.description ? (
            <Text
              style={[styles.meta, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {enrolled ? (
          <Text style={[styles.joined, { color: colors.mutedForeground }]}>
            Joined
          </Text>
        ) : (
          <AppIcon
            name="chevron-right"
            size={18}
            color={isDark ? bankChrome.chevronDark : colors.mutedForeground}
            strokeWidth={2}
          />
        )}
      </Pressable>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: divider }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: bankChrome.rowGap,
    paddingHorizontal: bankChrome.rowPaddingX,
    paddingVertical: bankChrome.rowPaddingY,
    minHeight: bankChrome.rowMinHeight,
  },
  pressed: {
    opacity: 0.82,
  },
  well: {
    width: bankChrome.wellSize,
    height: bankChrome.wellSize,
    borderRadius: bankChrome.wellSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.15,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 1,
  },
  joined: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft:
      bankChrome.rowPaddingX + bankChrome.wellSize + bankChrome.rowGap,
  },
});
