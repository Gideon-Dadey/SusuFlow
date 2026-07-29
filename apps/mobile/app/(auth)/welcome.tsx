import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandSplashBackground } from "@/components/launch/SplashBackground";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(12);

  useEffect(() => {
    contentOpacity.value = withDelay(
      80,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    contentTranslateY.value = withDelay(
      80,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
  }, [contentOpacity, contentTranslateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <BrandSplashBackground>
      <StatusBar style="light" />
      <Animated.View style={[styles.fill, contentStyle]}>
        <View style={[styles.body, { paddingTop: insets.top + 48 }]}>
          <View style={styles.brandBlock}>
            <Image
              source={BRAND_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.wordmark}>Credo</Text>
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 28 }]}>
          <Text style={styles.tagline}>SAVE WITH CONFIDENCE</Text>
          <Text style={styles.tagline}>BEGIN TODAY</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/register-intro")}
              style={({ pressed }) => [
                styles.action,
                styles.actionPrimary,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionPrimaryLabel}>REGISTER</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/login")}
              style={({ pressed }) => [
                styles.action,
                styles.actionSecondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionSecondaryLabel}>LOGIN</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </BrandSplashBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  brandBlock: {
    alignItems: "center",
    gap: 16,
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
  footer: {
    paddingHorizontal: 24,
    gap: 4,
  },
  tagline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: 1.4,
    textAlign: "center",
    color: "rgba(255,255,255,0.75)",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  action: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPrimary: {},
  actionSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
  },
  actionPrimaryLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: "#ffffff",
    letterSpacing: 1.1,
  },
  actionSecondaryLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: "#ffffff",
    letterSpacing: 1.1,
  },
  pressed: {
    opacity: 0.88,
  },
});
