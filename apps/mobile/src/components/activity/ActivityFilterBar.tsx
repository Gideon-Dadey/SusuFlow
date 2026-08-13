import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ActivityFilter } from "@/components/activity/transactionUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Deposits" },
  { id: "withdrawal", label: "Withdrawals" },
];

interface ActivityFilterBarProps {
  value: ActivityFilter;
  onChange: (filter: ActivityFilter) => void;
}

export function ActivityFilterBar({ value, onChange }: ActivityFilterBarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: isDark ? "#141414" : colors.muted,
          borderColor: colors.border,
        },
      ]}
    >
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(filter.id)}
            style={({ pressed }) => [
              styles.segment,
              active && {
                backgroundColor: colors.primary,
              },
              pressed && !active && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                {
                  color: active
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                  fontFamily: active
                    ? typography.fontFamily.semibold
                    : typography.fontFamily.medium,
                },
              ]}
            >
              {filter.label}
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
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.72,
  },
  segmentLabel: {
    fontSize: typography.size.xs,
    letterSpacing: -0.1,
  },
});
