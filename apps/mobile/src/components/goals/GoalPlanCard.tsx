import { CardSurface } from "@/components/ui/CardSurface";
import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  formatPlanAmountRange,
  formatPlanFrequency,
} from "@/components/goals/goalUtils";
import { getIconAccent } from "@/lib/icon-accents";
import type { SavingsPlan } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface GoalPlanCardProps {
  plan: SavingsPlan;
  enrolled?: boolean;
  onPress: () => void;
}

export function GoalPlanCard({ plan, enrolled, onPress }: GoalPlanCardProps) {
  const { colors, isDark } = useTheme();
  const accent = getIconAccent("target", isDark);

  return (
    <CardSurface
      innerStyle={[styles.cardShell, { opacity: enrolled ? 0.72 : 1 }]}
    >
      <Pressable
        accessibilityRole="button"
        disabled={enrolled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && !enrolled && styles.pressed,
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accent.bg }]}>
          <AppIcon name="target" size={18} color={accent.fg} />
        </View>

        <View style={styles.copy}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {plan.name}
          </Text>
          {plan.description ? (
            <Text
              style={[styles.description, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {plan.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={[styles.chip, { backgroundColor: colors.muted }]}>
              <Text
                style={[styles.chipText, { color: colors.mutedForeground }]}
              >
                {formatPlanFrequency(plan.frequency)}
              </Text>
            </View>
            <Text style={[styles.range, { color: colors.mutedForeground }]}>
              {formatPlanAmountRange(plan)}
            </Text>
          </View>
        </View>

        {enrolled ? (
          <View style={[styles.joinedBadge, { backgroundColor: colors.muted }]}>
            <Text
              style={[styles.joinedText, { color: colors.mutedForeground }]}
            >
              Joined
            </Text>
          </View>
        ) : (
          <AppIcon
            name="chevron-right"
            size={16}
            color={colors.mutedForeground}
          />
        )}
      </Pressable>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    overflow: "hidden",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 84,
  },
  pressed: {
    opacity: 0.86,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  description: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginTop: 2,
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    textTransform: "capitalize",
  },
  range: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  joinedBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  joinedText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
  },
});
