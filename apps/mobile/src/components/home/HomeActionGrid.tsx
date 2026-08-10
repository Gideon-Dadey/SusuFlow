import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { homeChrome, type HomeWellIcon } from "@/components/home/homeChrome";
import { HomeSectionTitle } from "@/components/home/HomeSectionTitle";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, surfaceRadius, typography } from "@/theme/tokens";

export interface HomeAction {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  /** @deprecated Kept for call-site compatibility; unused in the grid. */
  subtitle?: string;
}

const COLS = 3;
const GAP = 10;

function getWell(icon: AppIconName, isDark: boolean) {
  const map = isDark ? homeChrome.wellsDark : homeChrome.wells;
  if (icon in map) {
    return map[icon as HomeWellIcon];
  }
  return isDark
    ? { bg: "rgba(255,255,255,0.1)", fg: "#FFFFFF" }
    : { bg: "#F1F5F9", fg: "#0F172A" };
}

function ActionTile({
  action,
  colors,
  isDark,
  shadows,
}: {
  action: HomeAction;
  colors: ReturnType<typeof useTheme>["colors"];
  isDark: boolean;
  shadows: ReturnType<typeof useTheme>["shadows"];
}) {
  const well = getWell(action.icon, isDark);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={action.onPress}
      style={({ pressed }) => [
        styles.tileOuter,
        !isDark && shadows.card,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.tile,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={[styles.iconWell, { backgroundColor: well.bg }]}>
          <AppIcon name={action.icon} size={18} color={well.fg} />
        </View>
        <Text
          style={[styles.label, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {action.label}
        </Text>
      </View>
    </Pressable>
  );
}

export function HomeActionGrid({ actions }: { actions: HomeAction[] }) {
  const { colors, isDark, shadows } = useTheme();

  return (
    <View style={styles.section}>
      <HomeSectionTitle title="Quick Actions" />
      <View style={styles.grid}>
        {actions.map((action) => (
          <View key={action.label} style={styles.cell}>
            <ActionTile
              action={action}
              colors={colors}
              isDark={isDark}
              shadows={shadows}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -GAP / 2,
    rowGap: GAP,
  },
  cell: {
    width: `${100 / COLS}%`,
    paddingHorizontal: GAP / 2,
  },
  tileOuter: {
    borderRadius: surfaceRadius.card,
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 108,
    borderRadius: surfaceRadius.card,
  },
  iconWell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: typography.roles.title,
    fontSize: 12,
    letterSpacing: -0.1,
    textAlign: "center",
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
