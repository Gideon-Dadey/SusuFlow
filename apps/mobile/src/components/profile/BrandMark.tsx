import { Image, StyleSheet, View, type ViewStyle } from "react-native";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

interface BrandMarkProps {
  size?: number;
  framed?: boolean;
  style?: ViewStyle;
}

export function BrandMark({ size = 56, framed = true, style }: BrandMarkProps) {
  const { colors } = useTheme();

  const image = (
    <Image
      source={BRAND_LOGO}
      style={{ width: size * 0.72, height: size * 0.72 }}
      resizeMode="contain"
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
          width: size,
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
