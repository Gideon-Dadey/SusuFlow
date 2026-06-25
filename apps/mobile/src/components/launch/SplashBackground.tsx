import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { lightColors } from "@/theme/tokens";

/** Shared launch + welcome backdrop — matches native splash (`app.json`). */
export const BRAND_SPLASH_GRADIENT = ["#1a365d", "#152a4a", "#0f2038"] as const;

export const LAUNCH_SPLASH_DURATION_MS = 5000;

interface BrandSplashBackgroundProps {
  children?: ReactNode;
}

export function BrandSplashBackground({
  children,
}: BrandSplashBackgroundProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={BRAND_SPLASH_GRADIENT}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, styles.glowLeft]} />
      <View style={[styles.glow, styles.glowRight]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: lightColors.splashBackground,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  glowLeft: {
    top: "20%",
    left: -64,
  },
  glowRight: {
    bottom: "24%",
    right: -72,
    backgroundColor: "rgba(5, 150, 105, 0.1)",
  },
});
