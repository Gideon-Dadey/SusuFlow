import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CinematicWelcomeReel,
  WELCOME_SLIDE_MS,
} from "@/components/auth/CinematicWelcomeReel";
import { BRAND_LOGO, WELCOME_SLIDES } from "@/lib/brand-assets";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

const FRAMES = [
  {
    headline: "Save.",
    subcopy: "Verified deposits into your susu — every day, on your phone.",
  },
  {
    headline: "Grow.",
    subcopy: "Watch your balance build with clear plans and real receipts.",
  },
  {
    headline: "Live.",
    subcopy: "Withdraw with confidence when the moment calls for it.",
  },
] as const;

function FrameCopy({ index }: { index: number }) {
  const frame = FRAMES[index % FRAMES.length];
  const rise = useSharedValue(0);

  useEffect(() => {
    rise.value = 0;
    rise.value = withTiming(1, {
      duration: 780,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [index, rise]);

  const style = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [
      {
        translateY: interpolate(
          rise.value,
          [0, 1],
          [18, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.copyBlock, style]} accessibilityRole="header">
      <Text style={styles.headline}>{frame.headline}</Text>
      <Text style={styles.subcopy}>{frame.subcopy}</Text>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % WELCOME_SLIDES.length);
    }, WELCOME_SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <CinematicWelcomeReel sources={WELCOME_SLIDES} activeIndex={index} />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.5)",
          "rgba(0,0,0,0.12)",
          "rgba(0,0,0,0.42)",
          "rgba(0,0,0,0.94)",
        ]}
        locations={[0, 0.32, 0.58, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.chrome,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Animated.View
          entering={FadeInDown.duration(700).easing(Easing.out(Easing.cubic))}
          style={styles.brandRow}
        >
          <Image
            source={BRAND_LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="SusuFlow"
          />
        </Animated.View>

        <View style={styles.spacer} />

        <FrameCopy index={index} />

        <Animated.View
          entering={FadeInDown.delay(180)
            .duration(650)
            .easing(Easing.out(Easing.cubic))}
          style={styles.actions}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create account"
            onPress={() => router.push("/(auth)/register-intro")}
            style={({ pressed }) => [
              styles.btn,
              styles.btnPrimary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnPrimaryLabel}>Create account</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => [
              styles.btn,
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnSecondaryLabel}>Sign in</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  chrome: {
    flex: 1,
    paddingHorizontal: 22,
  },
  brandRow: {
    alignItems: "center",
  },
  logo: {
    width: 168,
    height: 64,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  copyBlock: {
    marginBottom: 22,
    minHeight: 132,
    justifyContent: "flex-end",
  },
  headline: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.6,
    color: "#ffffff",
  },
  subcopy: {
    marginTop: 14,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.72)",
    maxWidth: 300,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    minHeight: authChrome.controlHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: authChrome.controlRadius,
  },
  btnPrimary: {
    backgroundColor: authChrome.onBlackFill,
  },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  btnPrimaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.onBlackLabel,
    letterSpacing: -0.2,
  },
  btnSecondaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.ink,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.86,
  },
});
