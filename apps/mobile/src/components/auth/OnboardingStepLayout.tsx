import { ReactNode } from "react";
import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandSplashBackground } from "@/components/launch/SplashBackground";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

interface OnboardingStepLayoutProps {
  title: string;
  description: string;
  illustration: ReactNode;
  stepIndex: number;
  totalSteps: number;
  actionLabel?: string;
  onBack: () => void;
  onNext: () => void;
}

export function OnboardingStepLayout({
  title,
  description,
  illustration,
  stepIndex,
  totalSteps,
  actionLabel = "Next",
  onBack,
  onNext,
}: OnboardingStepLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <BrandSplashBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 24,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <BackArrowButton onPress={onBack} color={authChrome.ink} />

        <View style={styles.body}>
          <View style={styles.illustrationWrap}>{illustration}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === stepIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextPressed,
            ]}
          >
            <Text style={styles.nextLabel}>{actionLabel}</Text>
            <AppIcon
              name="arrow-right"
              size={18}
              color={authChrome.onBlackLabel}
              weight="bold"
            />
          </Pressable>
        </View>
      </View>
    </BrandSplashBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  illustrationWrap: {
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: -0.3,
    color: authChrome.ink,
  },
  description: {
    marginTop: 12,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
    color: authChrome.inkMuted,
  },
  footer: {
    gap: 28,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 2,
  },
  dotInactive: {
    width: 8,
    backgroundColor: authChrome.progressTrack,
  },
  dotActive: {
    width: 28,
    backgroundColor: authChrome.progressActive,
  },
  nextButton: {
    minHeight: authChrome.controlHeight,
    borderRadius: authChrome.controlRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: authChrome.onBlackFill,
  },
  nextPressed: {
    opacity: 0.82,
  },
  nextLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: authChrome.onBlackLabel,
    letterSpacing: -0.2,
  },
});
