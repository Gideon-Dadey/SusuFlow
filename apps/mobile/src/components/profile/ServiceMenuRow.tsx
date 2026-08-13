import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ServiceMenuRowProps {
  icon: AppIconName;
  label: string;
  subtitle?: string;
  wellBg: string;
  wellFg: string;
  onPress: () => void;
  showDivider?: boolean;
  destructive?: boolean;
}

/** Bank-style list row: colored icon well + title/subtitle + chevron. */
export function ServiceMenuRow({
  icon,
  label,
  wellBg,
  wellFg,
  onPress,
  showDivider = false,
  destructive = false,
}: ServiceMenuRowProps) {
  const { colors } = useTheme();
  const labelColor = destructive ? colors.destructive : colors.foreground;
  const iconFg = destructive ? colors.destructive : wellFg;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.well, { backgroundColor: wellBg }]}>
          <AppIcon name={icon} size={18} color={iconFg} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <AppIcon
          name="chevron-right"
          size={16}
          color={colors.mutedForeground}
        />
      </Pressable>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 64,
  },
  pressed: {
    opacity: 0.72,
  },
  well: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + spacing.md + spacing.md,
    marginRight: spacing.md,
  },
});
