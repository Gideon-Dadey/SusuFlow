import { FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getAvatarGradient } from "@/lib/avatar-palette";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

export type UserAvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<
  UserAvatarSize,
  { dimension: number; fontSize: number; ring: number; badge: number }
> = {
  sm: { dimension: 44, fontSize: 15, ring: 0, badge: 14 },
  md: { dimension: 56, fontSize: 18, ring: 2.5, badge: 18 },
  lg: { dimension: 80, fontSize: 28, ring: 3, badge: 22 },
  xl: { dimension: 96, fontSize: 34, ring: 3, badge: 24 },
};

interface UserAvatarProps {
  initials: string;
  seed?: string;
  size?: UserAvatarSize;
  loading?: boolean;
  showVerified?: boolean;
}

export function UserAvatar({
  initials,
  seed,
  size = "md",
  loading = false,
  showVerified = false,
}: UserAvatarProps) {
  const { colors, isDark } = useTheme();
  const spec = SIZE_MAP[size];
  const gradient = getAvatarGradient(seed ?? initials);
  const ringColor = isDark
    ? "rgba(255,255,255,0.22)"
    : "rgba(255,255,255,0.95)";
  const outerSize = spec.dimension + spec.ring * 2;

  const avatar = (dimension: number) => (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.avatar,
        {
          width: dimension,
          height: dimension,
          borderRadius: radius.full,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
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
  );

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
      {spec.ring > 0 ? (
        <View
          style={[
            styles.ring,
            {
              width: outerSize,
              height: outerSize,
              borderRadius: radius.full,
              borderColor: ringColor,
              borderWidth: spec.ring,
            },
          ]}
        >
          {avatar(spec.dimension)}
        </View>
      ) : (
        avatar(spec.dimension)
      )}

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
  ring: {
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
