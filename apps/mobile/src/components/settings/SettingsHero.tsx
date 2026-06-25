import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useProfileData } from "@/components/settings/useProfileData";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface SettingsHeroProps {
  onOpenMenu?: () => void;
}

export function SettingsHero({ onOpenMenu }: SettingsHeroProps) {
  const { colors } = useTheme();
  const { displayName, initials, email, phone, groupName, isLoading } =
    useProfileData();

  const gradientColors = [colors.primary800, colors.primary700] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#bbf7d0" />
          <Text style={styles.badgeText}>Verified member</Text>
        </View>
        {onOpenMenu ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile menu"
            onPress={onOpenMenu}
            style={styles.menuBtn}
          >
            <Ionicons name="menu" size={20} color="#ffffff" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.identity}>
        <View style={styles.avatar}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {email || "—"}
          </Text>
          {phone ? (
            <Text style={styles.meta} numberOfLines={1}>
              {phone}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.groupChip,
          { backgroundColor: "rgba(255,255,255,0.14)" },
        ]}
      >
        <Ionicons name="people-outline" size={14} color="#dcfce7" />
        <Text style={styles.groupLabel} numberOfLines={1}>
          {groupName}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  badgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    color: "#dcfce7",
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
    color: "#ffffff",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: "rgba(255,255,255,0.82)",
  },
  groupChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  groupLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    color: "#f0fdf4",
  },
});
