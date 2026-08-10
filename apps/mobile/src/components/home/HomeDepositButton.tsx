import { AppIcon } from "@/components/icons/AppIcon";
import { homeChrome } from "@/components/home/homeChrome";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, shadows, typography } from "@/theme/tokens";

interface HomeDepositButtonProps {
  onPress: () => void;
}

export function HomeDepositButton({ onPress }: HomeDepositButtonProps) {
  const { isDark } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        !isDark && shadows.card,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={
          isDark ? (["#0F766E", "#059669"] as const) : [...homeChrome.cta]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <AppIcon name="plus" size={18} color="#ffffff" />
        <Text style={styles.label}>Add money</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  button: {
    minHeight: 52,
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
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
