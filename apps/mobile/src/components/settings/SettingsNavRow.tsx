import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

interface SettingsNavRowProps {
  icon: AppIconName;
  label: string;
  description?: string;
  value?: string;
  destructive?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
}

export function SettingsNavRow({
  icon,
  label,
  description,
  value,
  destructive,
  onPress,
  showChevron = true,
}: SettingsNavRowProps) {
  const { colors } = useTheme();

  const content = (
    <>
      <View style={styles.iconSlot}>
        <AppIcon
          name={icon}
          size={22}
          color={destructive ? colors.destructive : colors.primary}
        />
      </View>
      <View style={styles.copy}>
        <Text
          style={[
            styles.label,
            { color: destructive ? colors.destructive : colors.foreground },
          ]}
        >
          {label}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          style={[styles.value, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}
      {showChevron && onPress ? (
        <AppIcon
          name="chevron-right"
          size={16}
          color={colors.mutedForeground}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.72,
  },
  iconSlot: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  description: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  value: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    maxWidth: 88,
  },
});
