import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

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

const LIGHT_GRADIENT = ["#1a365d", "#152a4a", "#12243f"] as const;

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
  const { colors, isDark } = useTheme();

  const content = (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 8, paddingHorizontal: 24 },
      ]}
    >
      <BackArrowButton
        onPress={onBack}
        color={isDark ? colors.foreground : "#ffffff"}
      />

      <View style={styles.body}>
        <View style={styles.illustrationWrap}>{illustration}</View>
        <Text
          style={[
            styles.title,
            { color: isDark ? colors.foreground : "#ffffff" },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: isDark ? colors.mutedForeground : "rgba(255,255,255,0.78)",
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === stepIndex
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : [
                      styles.dotInactive,
                      {
                        backgroundColor: isDark ? colors.border : colors.muted,
                      },
                    ],
              ]}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onNext}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.primary },
            pressed && styles.nextPressed,
          ]}
        >
          <Text style={styles.nextLabel}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );

  if (isDark) {
    return <AuthScreenShell>{content}</AuthScreenShell>;
  }

  return (
    <View style={[styles.shell, { backgroundColor: colors.splashBackground }]}>
      <LinearGradient colors={LIGHT_GRADIENT} style={StyleSheet.absoluteFill} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
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
  },
  description: {
    marginTop: 12,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
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
    borderRadius: radius.sm,
  },
  dotInactive: {
    width: 8,
  },
  dotActive: {
    width: 28,
  },
  nextButton: {
    minHeight: 54,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextPressed: {
    opacity: 0.92,
  },
  nextLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
    color: "#ffffff",
  },
});
