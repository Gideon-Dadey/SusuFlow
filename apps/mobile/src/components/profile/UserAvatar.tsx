import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { getAvatarGradient } from "@/lib/avatar-palette";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

export type UserAvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<
  UserAvatarSize,
  { dimension: number; fontSize: number; badge: number }
> = {
  sm: { dimension: 44, fontSize: 15, badge: 14 },
  md: { dimension: 56, fontSize: 18, badge: 18 },
  lg: { dimension: 80, fontSize: 28, badge: 22 },
  xl: { dimension: 96, fontSize: 34, badge: 24 },
};

interface UserAvatarProps {
  initials: string;
  seed?: string;
  /** Remote URL or data URL — falls back to initials if missing/broken */
  imageUrl?: string | null;
  size?: UserAvatarSize;
  loading?: boolean;
  showVerified?: boolean;
}

export function UserAvatar({
  initials,
  seed,
  imageUrl,
  size = "md",
  loading = false,
  showVerified = false,
}: UserAvatarProps) {
  const { colors } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const spec = SIZE_MAP[size];
  const gradient = getAvatarGradient(seed ?? initials);
  const outerSize = spec.dimension;
  const showImage = !!imageUrl && !imageFailed && !loading;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: outerSize,
          height: outerSize,
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.avatar,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: radius.full,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : showImage ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: radius.full,
            }}
            onError={() => setImageFailed(true)}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                fontSize: spec.fontSize,
                lineHeight: spec.fontSize + 2,
              },
            ]}
            numberOfLines={1}
          >
            {initials}
          </Text>
        )}
      </LinearGradient>

      {showVerified && !loading ? (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: spec.badge,
              height: spec.badge,
              borderRadius: spec.badge / 2,
              backgroundColor: colors.primary,
              borderColor: colors.card,
            },
          ]}
        >
          <FontAwesome6
            name="check"
            size={spec.badge * 0.45}
            color="#ffffff"
            solid
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontFamily: typography.roles.display,
    color: "#ffffff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
