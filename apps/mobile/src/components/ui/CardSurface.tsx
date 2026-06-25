import { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

interface CardSurfaceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

/** Elevated card — shadow in light mode, hairline border in dark mode. */
export function CardSurface({ children, style, innerStyle }: CardSurfaceProps) {
  const { colors, isDark, shadows } = useTheme();

  const inner = [
    styles.inner,
    { backgroundColor: colors.card, borderRadius: radius.lg },
    isDark && {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    innerStyle,
    style,
  ];

  if (isDark) {
    return <View style={[inner, styles.clip]}>{children}</View>;
  }

  return (
    <View style={[shadows.card, styles.outer, { borderRadius: radius.lg }]}>
      <View style={[inner, styles.clip]}>{children}</View>
    </View>
  );
}

/** Styles for components that need shadow on an outer wrapper. */
export function useCardSurfaceStyle() {
  const { colors, isDark, shadows } = useTheme();

  if (isDark) {
    return {
      outer: null as ViewStyle | null,
      inner: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
      } satisfies ViewStyle,
    };
  }

  return {
    outer: {
      ...shadows.card,
      borderRadius: radius.lg,
    } satisfies ViewStyle,
    inner: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
    } satisfies ViewStyle,
  };
}

const styles = StyleSheet.create({
  outer: {
    alignSelf: "stretch",
  },
  inner: {
    alignSelf: "stretch",
  },
  clip: {
    overflow: "hidden",
  },
});
