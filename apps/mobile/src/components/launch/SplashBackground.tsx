import type { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SPLASH_BACKGROUND } from "@/lib/brand-assets";

/** Launch + welcome canvas — black base + atmospheric photo. */
export const BRAND_SPLASH_BACKGROUND = "#000000";

export const LAUNCH_SPLASH_DURATION_MS = 5000;

interface BrandSplashBackgroundProps {
  children?: ReactNode;
}

export function BrandSplashBackground({
  children,
}: BrandSplashBackgroundProps) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={SPLASH_BACKGROUND}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      >
        {/* Soft scrim keeps logo / CTAs crisp on every device. */}
        <View style={styles.scrim} pointerEvents="none" />
      </ImageBackground>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_SPLASH_BACKGROUND,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  content: {
    flex: 1,
  },
});
