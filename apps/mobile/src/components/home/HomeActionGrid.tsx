import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { HomeSectionTitle } from "@/components/home/HomeSectionTitle";
import { CardSurface } from "@/components/ui/CardSurface";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getIconAccent } from "@/lib/icon-accents";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface HomeAction {
  label: string;
  subtitle: string;
  icon: AppIconName;
  onPress: () => void;
}

function ActionRow({
  action,
  colors,
  isDark,
  showDivider,
}: {
  action: HomeAction;
  colors: ReturnType<typeof useTheme>["colors"];
  isDark: boolean;
  showDivider: boolean;
}) {
  const accent = getIconAccent(action.icon, isDark);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={action.onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accent.bg }]}>
          <AppIcon name={action.icon} size={17} color={accent.fg} />
        </View>
        <View style={styles.copy}>
          <Text
            style={[styles.label, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {action.label}
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {action.subtitle}
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
    </>
  );
}

export function HomeActionGrid({ actions }: { actions: HomeAction[] }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.section}>
      <HomeSectionTitle title="Shortcuts" />
      <CardSurface innerStyle={styles.card}>
        {actions.map((action, index) => (
          <ActionRow
            key={action.label}
            action={action}
            colors={colors}
            isDark={isDark}
            showDivider={index < actions.length - 1}
          />
        ))}
      </CardSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    minHeight: 60,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + spacing.md + spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
});
