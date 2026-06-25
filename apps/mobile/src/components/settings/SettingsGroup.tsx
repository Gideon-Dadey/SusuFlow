import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardSurface } from "@/components/ui/CardSurface";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface SettingsGroupProps {
  title: string;
  children: ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <CardSurface innerStyle={styles.card}>{children}</CardSurface>
    </View>
  );
}

export function SettingsDivider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginLeft: 4,
  },
  card: {
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
});
