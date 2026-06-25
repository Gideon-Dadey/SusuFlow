import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface OptionsMenuButtonProps {
  onPress: () => void;
  showStatusDot?: boolean;
  iconSize?: number;
  controlSize?: number;
}

export function OptionsMenuButton({
  onPress,
  showStatusDot = true,
  iconSize = 20,
  controlSize = 44,
}: OptionsMenuButtonProps) {
  const { colors, isDark } = useTheme();

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
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: colors.warning,
            borderColor: isDark ? colors.background : colors.background,
            opacity: showStatusDot ? 1 : 0,
            top: controlSize * 0.2,
            right: controlSize * 0.18,
          },
        ]}
      />
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
  statusDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
  },
});
