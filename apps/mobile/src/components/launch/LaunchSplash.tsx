import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  BrandSplashBackground,
  LAUNCH_SPLASH_DURATION_MS,
} from "@/components/launch/SplashBackground";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { typography } from "@/theme/tokens";

const FADE_OUT_MS = 700;
const FADE_OUT_START_MS = LAUNCH_SPLASH_DURATION_MS - FADE_OUT_MS;

interface LaunchSplashProps {
  onFinish: () => void;
}

export function LaunchSplash({ onFinish }: LaunchSplashProps) {
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const screenOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoRotateY = useSharedValue(78);
  const logoScale = useSharedValue(0.88);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(10);

  useEffect(() => {
    const finish = () => {
      onFinishRef.current();
    };

    logoOpacity.value = withTiming(1, {
      duration: 680,
      easing: Easing.out(Easing.cubic),
    });
    logoRotateY.value = withTiming(0, {
      duration: 980,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSequence(
      withTiming(1.04, {
        duration: 680,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.quad),
      }),
    );
    wordmarkOpacity.value = withDelay(
      560,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    wordmarkTranslateY.value = withDelay(
      560,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );

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
  }, [
    logoOpacity,
    logoRotateY,
    logoScale,
    screenOpacity,
    wordmarkOpacity,
    wordmarkTranslateY,
  ]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { perspective: 900 },
      { rotateY: `${logoRotateY.value}deg` },
      { scale: logoScale.value },
    ],
  }));

  const wordmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.fill, screenStyle]}>
      <BrandSplashBackground>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Animated.View style={[styles.logoWrap, logoAnimatedStyle]}>
            <Image
              source={BRAND_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text style={[styles.wordmark, wordmarkAnimatedStyle]}>
            Credo
          </Animated.Text>
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
    gap: 16,
    paddingHorizontal: 32,
  },
  logoWrap: {
    backfaceVisibility: "hidden",
  },
  logo: {
    width: 112,
    height: 112,
  },
  wordmark: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    letterSpacing: -0.5,
    color: "#ffffff",
  },
});
