import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { getIconAccent } from "@/lib/icon-accents";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

interface TenantBrandMarkProps {
  logoUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Company logo with crisp fallback — used on home, goals, and settings. */
export function TenantBrandMark({
  logoUrl,
  size = 44,
  style,
}: TenantBrandMarkProps) {
  const { isDark } = useTheme();
  const accent = getIconAccent("users", isDark);
  const [failed, setFailed] = useState(false);
  const showLogo = !!logoUrl && !failed;
  const corner = Math.round(size * 0.28);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  if (showLogo) {
    return (
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: corner,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
          },
          style,
        ]}
      >
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size, height: size, borderRadius: corner }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: corner || radius.md,
          backgroundColor: accent.bg,
        },
        style,
      ]}
    >
      <AppIcon name="users" size={Math.round(size * 0.42)} color={accent.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
