import {
  TabBarIcon,
  type TabBarIconName,
} from "@/components/navigation/TabBarIcon";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TAB_BAR_FAB_OVERHANG,
  TAB_BAR_HORIZONTAL_INSET,
  TAB_BAR_ICON_SIZE,
  TAB_BAR_ICON_SLOT,
  TAB_BAR_ITEM_GAP,
  TAB_BAR_MIN_BOTTOM_INSET,
  TAB_BAR_PADDING_TOP,
} from "@/constants/tab-bar";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

interface TabRoute {
  name: string;
  key: string;
}

interface CustomTabBarProps {
  state: {
    index: number;
    routes: TabRoute[];
  };
  navigation: {
    navigate: (name: string, params?: object) => void;
  };
}

interface TabConfig {
  routeName: string;
  label: string;
  icon: TabBarIconName;
  elevated?: boolean;
}

const FAB_SIZE = 56;

const VISIBLE_TABS: TabConfig[] = [
  { routeName: "index", label: "Home", icon: "home" },
  { routeName: "plans", label: "Goals", icon: "goals" },
  { routeName: "deposit", label: "Deposit", icon: "deposit", elevated: true },
  { routeName: "activity", label: "Activity", icon: "activity" },
  { routeName: "profile", label: "More", icon: "more" },
];

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, shadows } = useTheme();

  const barBg = isDark ? bankChrome.pageDark : bankChrome.pageLight;
  const inactiveColor = colors.mutedForeground;
  const tabActiveColor = colors.primary;
  const borderTop = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const handleTabPress = (tab: TabConfig) => {
    // Always land on the More listing, never a nested detail screen.
    if (tab.routeName === "profile") {
      router.navigate("/(tabs)/profile");
      return;
    }

    navigation.navigate(tab.routeName);
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: TAB_BAR_PADDING_TOP,
          paddingBottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET),
          paddingHorizontal: TAB_BAR_HORIZONTAL_INSET,
          backgroundColor: barBg,
          borderTopColor: borderTop,
        },
        !isDark && shadows.subtle,
      ]}
    >
      {VISIBLE_TABS.map((tab) => {
        const routeIndex = state.routes.findIndex(
          (r) => r.name === tab.routeName,
        );
        if (routeIndex < 0) return null;

        const focused = state.index === routeIndex;
        const activeColor = focused ? tabActiveColor : inactiveColor;

        if (tab.elevated) {
          const fabBg = isDark ? "#F8FAFC" : colors.primary;
          const fabFg = isDark ? "#0F172A" : colors.primaryForeground;
          return (
            <Pressable
              key={tab.routeName}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => handleTabPress(tab)}
              style={({ pressed }) => [
                styles.tab,
                styles.elevatedTab,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.fab,
                  {
                    backgroundColor: fabBg,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(0,0,0,0.08)",
                  },
                  shadows.elevated,
                  focused && styles.fabFocused,
                ]}
              >
                <TabBarIcon name={tab.icon} size={24} color={fabFg} focused />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: activeColor,
                    fontFamily: focused
                      ? typography.roles.label
                      : typography.roles.caption,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.routeName}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            onPress={() => handleTabPress(tab)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={styles.iconSlot}>
              <TabBarIcon
                name={tab.icon}
                size={TAB_BAR_ICON_SIZE}
                color={activeColor}
                focused={focused}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: activeColor,
                  fontFamily: focused
                    ? typography.roles.label
                    : typography.roles.caption,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    overflow: "visible",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: TAB_BAR_ITEM_GAP,
    paddingVertical: 2,
    overflow: "visible",
  },
  elevatedTab: {
    marginTop: -TAB_BAR_FAB_OVERHANG,
  },
  iconSlot: {
    width: TAB_BAR_ICON_SLOT,
    height: TAB_BAR_ICON_SLOT,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  fabFocused: {
    transform: [{ scale: 1.04 }],
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 10,
    lineHeight: 12,
  },
});
