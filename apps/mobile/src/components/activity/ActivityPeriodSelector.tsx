import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ACTIVITY_PERIOD_LABELS,
  type ActivityPeriod,
} from "@/components/activity/transactionUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

const PERIODS: ActivityPeriod[] = ["this_month", "last_month", "all_time"];

interface ActivityPeriodSelectorProps {
  value: ActivityPeriod;
  onChange: (period: ActivityPeriod) => void;
}

export function ActivityPeriodSelector({
  value,
  onChange,
}: ActivityPeriodSelectorProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: colors.muted,
          borderColor: colors.border,
        },
      ]}
    >
      {PERIODS.map((period) => {
        const active = value === period;
        return (
          <Pressable
            key={period}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(period)}
            style={({ pressed }) => [
              styles.segment,
              active && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              pressed && !active && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.foreground : colors.mutedForeground,
                  fontFamily: active
                    ? typography.fontFamily.semibold
                    : typography.fontFamily.medium,
                },
              ]}
              numberOfLines={1}
            >
              {ACTIVITY_PERIOD_LABELS[period]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  pressed: {
    opacity: 0.72,
  },
  label: {
    fontSize: 11,
    letterSpacing: -0.1,
  },
});
