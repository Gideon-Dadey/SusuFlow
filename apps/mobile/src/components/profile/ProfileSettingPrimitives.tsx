import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

import { getSupportEmail } from "@/lib/config";

export { appVersion } from "@/lib/app-version";

type IoniconName = keyof typeof Ionicons.glyphMap;

export function openSupportEmail() {
  Linking.openURL(`mailto:${getSupportEmail()}`);
}

interface SettingRowProps {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
}

export function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
}: SettingRowProps) {
  const { colors } = useTheme();

  const content = (
    <>
      <View style={styles.iconSlot}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.mutedForeground}
          />
        ) : null)}
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

interface SettingToggleProps {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: SettingToggleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.iconSlot}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.pillLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.pillValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  pressed: {
    opacity: 0.82,
  },
  iconSlot: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  rowSubtitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  pill: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  pillLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
  },
  pillValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
  },
});
