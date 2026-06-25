import { Pressable, StyleSheet } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTheme } from "@/theme/ThemeProvider";

interface BackArrowButtonProps {
  onPress: () => void;
  color?: string;
}

export function BackArrowButton({ onPress, color }: BackArrowButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.hitArea, pressed && styles.pressed]}
    >
      <AppIcon
        name="chevron-left"
        size={24}
        color={color ?? colors.foreground}
        strokeWidth={2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
  },
  pressed: {
    opacity: 0.55,
  },
});
