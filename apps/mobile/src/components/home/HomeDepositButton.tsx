import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

interface HomeDepositButtonProps {
  onPress: () => void;
}

export function HomeDepositButton({ onPress }: HomeDepositButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary },
        pressed && styles.pressed,
      ]}
    >
      <AppIcon name="plus" size={18} color={colors.primaryForeground} />
      <Text style={[styles.label, { color: colors.primaryForeground }]}>
        Add money
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: typography.roles.cta,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  pressed: {
    opacity: 0.9,
  },
});
