import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface OptionsMenuButtonProps {
  onPress: () => void;
  iconSize?: number;
  controlSize?: number;
  /** @deprecated Status badge removed — kept so call sites keep compiling. */
  showStatusDot?: boolean;
}

export function OptionsMenuButton({
  onPress,
  iconSize = 20,
  controlSize = 44,
}: OptionsMenuButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      accessibilityHint="Opens support and preference options"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.hitArea,
        { width: controlSize, height: controlSize },
        pressed && styles.pressed,
      ]}
    >
      <FontAwesome6 name="bars" size={iconSize} color={colors.heading} solid />
    </Pressable>
  );
}

/** @deprecated Use OptionsMenuButton */
export const ProfileMenuButton = OptionsMenuButton;

const styles = StyleSheet.create({
  hitArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
