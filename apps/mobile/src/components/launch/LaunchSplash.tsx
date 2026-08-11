import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import {
  BrandSplashBackground,
  LAUNCH_SPLASH_DURATION_MS,
} from "@/components/launch/SplashBackground";
import { BRAND_LOGO } from "@/lib/brand-splash";

const FADE_OUT_MS = 280;
const FADE_OUT_START_MS = Math.max(
  400,
  LAUNCH_SPLASH_DURATION_MS - FADE_OUT_MS,
);

interface LaunchSplashProps {
  onFinish: () => void;
}

export function LaunchSplash({ onFinish }: LaunchSplashProps) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const screenOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.96);

  useEffect(() => {
    const finish = () => {
      onFinishRef.current();
    };

    logoOpacity.value = withTiming(1, {
      duration: 560,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });

    screenOpacity.value = withDelay(
      FADE_OUT_START_MS,
      withTiming(
        0,
        { duration: FADE_OUT_MS, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(finish)();
          }
        },
      ),
    );
  }, [logoOpacity, logoScale, screenOpacity]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <Animated.View style={[styles.fill, screenStyle]}>
      <BrandSplashBackground>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Animated.View style={logoAnimatedStyle}>
            <Image
              source={BRAND_LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SusuFlow"
            />
          </Animated.View>
        </View>
      </BrandSplashBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: 248,
    height: 94,
  },
});
