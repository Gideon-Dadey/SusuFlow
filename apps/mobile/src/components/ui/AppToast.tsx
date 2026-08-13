import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { useToastStore, type ToastVariant } from "@/stores/toast.store";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const VARIANT_ICON: Record<ToastVariant, AppIconName> = {
  success: "check",
  error: "close",
  info: "info",
};

/**
 * Non-blocking status toast — banking standard for “saved / enabled”
 * feedback. Prefer this over Alert.alert for success.
 */
export function AppToastHost() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!current) {
      progress.value = withTiming(0, { duration: 160 });
      return;
    }

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      progress.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(dismiss)();
      });
    }, current.durationMs);

    return () => clearTimeout(timer);
  }, [current, dismiss, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: (1 - progress.value) * 16,
      },
    ],
  }));

  if (!current) return null;

  const variant = current.variant;
  const surface = isDark ? "#1C1C1E" : "#111111";
  const label = "#FFFFFF";
  const iconWell =
    variant === "success"
      ? "rgba(52,211,153,0.22)"
      : variant === "error"
        ? "rgba(248,113,113,0.22)"
        : "rgba(255,255,255,0.14)";
  const iconColor =
    variant === "success"
      ? "#34D399"
      : variant === "error"
        ? "#F87171"
        : "#FFFFFF";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}
    >
      <Animated.View style={[styles.toastWrap, animatedStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={current.message}
          onPress={dismiss}
          style={[styles.toast, { backgroundColor: surface }]}
        >
          <View style={[styles.iconWell, { backgroundColor: iconWell }]}>
            <AppIcon
              name={VARIANT_ICON[variant]}
              size={16}
              color={iconColor}
              weight="bold"
            />
          </View>
          <Text style={[styles.message, { color: label }]} numberOfLines={3}>
            {current.message}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toastWrap: {
    width: "100%",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.1,
  },
});
