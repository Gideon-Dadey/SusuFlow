import { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { surfaceRadius } from "@/theme/tokens";

interface CardSurfaceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

/** Elevated card — border + soft shadow in light mode, hairline border in dark. */
export function CardSurface({ children, style, innerStyle }: CardSurfaceProps) {
  const { colors, isDark, shadows } = useTheme();

  const edge = {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  };

  const inner = [
    styles.inner,
    {
      backgroundColor: colors.card,
      borderRadius: surfaceRadius.card,
      ...edge,
    },
    innerStyle,
    style,
  ];

  if (isDark) {
    return <View style={[inner, styles.clip]}>{children}</View>;
  }

  return (
    <View
      style={[shadows.card, styles.outer, { borderRadius: surfaceRadius.card }]}
    >
      <View style={[inner, styles.clip]}>{children}</View>
    </View>
  );
}

/** Styles for components that need shadow on an outer wrapper. */
export function useCardSurfaceStyle() {
  const { colors, isDark, shadows } = useTheme();

  const edge = {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  };

  if (isDark) {
    return {
      outer: null as ViewStyle | null,
      inner: {
        backgroundColor: colors.card,
        borderRadius: surfaceRadius.card,
        ...edge,
      } satisfies ViewStyle,
    };
  }

  return {
    outer: {
      ...shadows.card,
      borderRadius: surfaceRadius.card,
    } satisfies ViewStyle,
    inner: {
      backgroundColor: colors.card,
      borderRadius: surfaceRadius.card,
      ...edge,
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
