import { Image, StyleSheet, View } from "react-native";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { spacing } from "@/theme/tokens";

interface AuthBrandHeaderProps {
  onDark?: boolean;
  size?: "md" | "lg";
}

export function AuthBrandHeader({ size = "md" }: AuthBrandHeaderProps) {
  const isLarge = size === "lg";

  return (
    <View style={styles.row}>
      <Image
        source={BRAND_LOGO}
        style={[styles.logo, isLarge && styles.logoLg]}
        resizeMode="contain"
        accessibilityLabel="SusuFlow"
      />
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
    width: 148,
    height: 56,
  },
  logoLg: {
    width: 190,
    height: 72,
  },
});
