import { Image, StyleSheet, View, type ViewStyle } from "react-native";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

interface BrandMarkProps {
  size?: number;
  framed?: boolean;
  style?: ViewStyle;
}

/** Wide wordmark; `size` controls height. */
export function BrandMark({ size = 56, framed = true, style }: BrandMarkProps) {
  const { colors } = useTheme();
  const width = Math.round(size * 2.64);

  const image = (
    <Image
      source={BRAND_LOGO}
      style={{
        width: framed ? width * 0.85 : width,
        height: framed ? size * 0.72 : size,
      }}
      resizeMode="contain"
      accessibilityLabel="SusuFlow"
    />
  );

  if (!framed) {
    return <View style={style}>{image}</View>;
  }

  return (
    <View
      style={[
        styles.frame,
        {
          width: Math.round(size * 2.2),
          height: size,
          borderRadius: radius.lg,
          backgroundColor: colors.surfaceGlow,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
