import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";
import type { ProfileSectionId } from "@/types/profile";

export type { ProfileSectionId } from "@/types/profile";
export { PROFILE_MENU_ITEMS } from "@/types/profile";

interface MenuItem {
  id: ProfileSectionId;
  label: string;
  icon: AppIconName;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "account", label: "Account", icon: "profile" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "notifications", label: "Alerts", icon: "bell" },
  { id: "appearance", label: "Theme", icon: "palette" },
  { id: "help", label: "Help", icon: "help" },
  { id: "about", label: "About", icon: "info" },
];

interface ProfileSidebarProps {
  activeSection: ProfileSectionId;
  onSelect: (id: ProfileSectionId) => void;
  onSignOut: () => void;
}

export function ProfileSidebar({
  activeSection,
  onSelect,
  onSignOut,
}: ProfileSidebarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 8,
          backgroundColor: colors.sidebar,
          borderRightColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.mutedForeground }]}>
        Settings
      </Text>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [
                styles.item,
                active && { backgroundColor: colors.sidebarActive },
                pressed && styles.itemPressed,
              ]}
            >
              <AppIcon
                name={item.icon}
                size={22}
                color={active ? colors.primary : colors.mutedForeground}
                weight={active ? "fill" : "regular"}
              />
              <Text
                style={[
                  styles.itemLabel,
                  { color: active ? colors.primary : colors.mutedForeground },
                  active && styles.itemLabelActive,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSignOut}
        style={({ pressed }) => [
          styles.signOut,
          { borderTopColor: colors.border },
          pressed && styles.itemPressed,
        ]}
      >
        <AppIcon name="logout" size={22} color={colors.destructive} />
        <Text style={[styles.signOutLabel, { color: colors.destructive }]}>
          Sign out
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 92,
    borderRightWidth: 1,
  },
  heading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 8,
  },
  menu: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 6,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
  },
  itemPressed: {
    opacity: 0.75,
  },
  itemLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    textAlign: "center",
  },
  itemLabelActive: {
    fontFamily: typography.fontFamily.semibold,
  },
  signOut: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderTopWidth: 1,
  },
  signOutLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    textAlign: "center",
  },
});
