import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.muted }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.tab,
              active && [
                styles.tabActive,
                {
                  backgroundColor: "#ffffff",
                  shadowColor: "#0f172a",
                },
              ],
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                active
                  ? { color: "#0f172a", fontFamily: typography.fontFamily.bold }
                  : { color: colors.mutedForeground },
              ]}
            >
              {option.label}
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
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
