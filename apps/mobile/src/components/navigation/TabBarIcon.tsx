import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { TAB_BAR_ICON_SIZE } from "@/constants/tab-bar";

export type TabBarIconName =
  | "home"
  | "goals"
  | "deposit"
  | "activity"
  | "profile";

type Fa6Name = keyof typeof FontAwesome6.glyphMap;

const TAB_ICONS: Record<Exclude<TabBarIconName, "deposit">, Fa6Name> = {
  home: "house",
  goals: "bullseye",
  activity: "clock-rotate-left",
  profile: "circle-user",
};

interface TabBarIconProps {
  name: TabBarIconName;
  size?: number;
  color: string;
  focused?: boolean;
}

/**
 * Bamboo-style deposit glyph: ↑ on the left (slightly higher), ↓ on the right (slightly lower).
 */
function DepositArrowsIcon({
  size,
  color,
  solid,
}: {
  size: number;
  color: string;
  solid: boolean;
}) {
  const arrowSize = Math.round(size * 0.5);
  const arrowGap = Math.max(2, Math.round(size * 0.14));
  const verticalOffset = Math.max(1, Math.round(size * 0.09));

  return (
    <View
      style={[
        styles.depositGlyph,
        { width: size, height: size, gap: arrowGap },
      ]}
    >
      <View style={{ transform: [{ translateY: -verticalOffset }] }}>
        <FontAwesome6
          name="arrow-up"
          size={arrowSize}
          color={color}
          solid={solid}
        />
      </View>
      <View style={{ transform: [{ translateY: verticalOffset }] }}>
        <FontAwesome6
          name="arrow-down"
          size={arrowSize}
          color={color}
          solid={solid}
        />
      </View>
    </View>
  );
}

export function TabBarIcon({
  name,
  size = TAB_BAR_ICON_SIZE,
  color,
  focused = false,
}: TabBarIconProps) {
  const solid = focused;

  if (name === "deposit") {
    return <DepositArrowsIcon size={size} color={color} solid={solid} />;
  }

  return (
    <FontAwesome6
      name={TAB_ICONS[name]}
      size={size}
      color={color}
      solid={solid}
    />
  );
}

const styles = StyleSheet.create({
  depositGlyph: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
