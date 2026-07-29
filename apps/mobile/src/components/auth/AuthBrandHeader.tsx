import { Image, StyleSheet, Text, View } from "react-native";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface AuthBrandHeaderProps {
  onDark?: boolean;
  size?: "md" | "lg";
}

export function AuthBrandHeader({
  onDark = false,
  size = "md",
}: AuthBrandHeaderProps) {
  const { colors } = useTheme();
  const isLarge = size === "lg";

  return (
    <View style={styles.row}>
      <Image
        source={BRAND_LOGO}
        style={[styles.logo, isLarge && styles.logoLg]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.wordmark,
          isLarge && styles.wordmarkLg,
          { color: onDark ? "#ffffff" : colors.heading },
        ]}
      >
        Credo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoLg: {
    width: 52,
    height: 52,
  },
  wordmark: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    letterSpacing: -0.3,
  },
  wordmarkLg: {
    fontSize: 28,
  },
});
