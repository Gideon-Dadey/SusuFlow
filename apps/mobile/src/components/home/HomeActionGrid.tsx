import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { homeChrome, type HomeWellIcon } from "@/components/home/homeChrome";
import { HomeSectionTitle } from "@/components/home/HomeSectionTitle";
import { bankChrome } from "@/theme/bankChrome";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export interface HomeAction {
  label: string;
  icon: AppIconName;
  onPress: () => void;
  subtitle?: string;
}

function wellForAction(
  icon: AppIconName,
  isDark: boolean,
): { bg: string; fg: string } {
  const key = (icon in homeChrome.wells ? icon : "receipt") as HomeWellIcon;
  return isDark ? homeChrome.wellsDark[key] : homeChrome.wells[key];
}

/** Circular quick-access row — bank-inspired, SusuFlow labels. */
export function HomeActionGrid({
  actions,
  onViewAll,
}: {
  actions: HomeAction[];
  onViewAll?: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.section}>
      <HomeSectionTitle
        title="Quick access"
        right={
          onViewAll ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all services"
              onPress={onViewAll}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text
                style={[
                  styles.viewAll,
                  {
                    color: isDark ? homeChrome.linkDark : colors.primary,
                  },
                ]}
              >
                View all
              </Text>
            </Pressable>
          ) : null
        }
      />
      <View style={styles.row}>
        {actions.map((action) => {
          const well = wellForAction(action.icon, isDark);
          return (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.well,
                  {
                    backgroundColor: isDark ? "#141414" : colors.card,
                    borderColor: isDark
                      ? bankChrome.dividerDark
                      : bankChrome.dividerLight,
                  },
                ]}
              >
                <AppIcon
                  name={action.icon}
                  size={24}
                  color={well.fg}
                  weight="regular"
                />
              </View>
              <Text
                style={[styles.label, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    maxWidth: "25%",
  },
  well: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: typography.roles.title,
    fontSize: 11,
    letterSpacing: -0.1,
    textAlign: "center",
    lineHeight: 14,
  },
  viewAll: {
    fontFamily: typography.roles.label,
    fontSize: 13,
    letterSpacing: -0.1,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.82,
  },
});
