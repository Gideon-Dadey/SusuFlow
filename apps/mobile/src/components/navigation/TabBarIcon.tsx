import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { TAB_BAR_ICON_SIZE } from "@/constants/tab-bar";

export type TabBarIconName = "home" | "goals" | "deposit" | "activity" | "more";

/**
 * Tab marks share the same Phosphor glyphs as Quick Access:
 * house · flag · wallet · clock-history · grid
 */
const TAB_ICONS: Record<TabBarIconName, AppIconName> = {
  home: "home",
  goals: "goals",
  deposit: "deposit",
  activity: "activity",
  more: "more",
};

interface TabBarIconProps {
  name: TabBarIconName;
  size?: number;
  color: string;
  focused?: boolean;
}

export function TabBarIcon({
  name,
  size = TAB_BAR_ICON_SIZE,
  color,
  focused = false,
}: TabBarIconProps) {
  return (
    <AppIcon
      name={TAB_ICONS[name]}
      size={size}
      color={color}
      weight={focused ? "fill" : "regular"}
    />
  );
}
