import { FontAwesome6 } from "@expo/vector-icons";
import { TAB_BAR_ICON_SIZE } from "@/constants/tab-bar";

export type TabBarIconName =
  | "home"
  | "goals"
  | "deposit"
  | "activity"
  | "profile";

type Fa6Name = keyof typeof FontAwesome6.glyphMap;

/**
 * Tab marks aligned with common US consumer-finance patterns:
 * house · flag (goals) · circle-plus (add funds) · list (activity) · user
 * Solid when focused, outline when idle.
 */
const TAB_ICONS: Record<TabBarIconName, Fa6Name> = {
  home: "house",
  goals: "flag",
  deposit: "circle-plus",
  activity: "rectangle-list",
  profile: "circle-user",
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
    <FontAwesome6
      name={TAB_ICONS[name]}
      size={size}
      color={color}
      solid={focused}
    />
  );
}
