import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatLastLoginLabel } from "@/lib/last-login";
import { homeChrome } from "@/components/home/homeChrome";
import { HomeNotificationBell } from "@/components/notifications/HomeNotificationBell";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProfileData } from "@/components/settings/useProfileData";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

const HEADER_CONTROL_SIZE = 44;
const HEADER_ICON_SIZE = 20;

export function HomeHeader() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const lastLoginAt = useAuthStore((s) => s.lastLoginAt);
  const { displayName, initials, isLoading, avatarUrl } = useProfileData();
  const firstName = displayName.split(/\s+/)[0] || "there";
  const lastLoginLabel = formatLastLoginLabel(lastLoginAt);

  const openProfile = () => {
    router.push("/my-profile" as Href);
  };

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={openProfile}
        style={({ pressed }) => [
          styles.leading,
          pressed && styles.leadingPressed,
        ]}
      >
        <UserAvatar
          initials={initials}
          seed={displayName}
          imageUrl={avatarUrl}
          size="sm"
          loading={isLoading}
          showVerified
        />

        <View style={styles.greeting}>
          {isLoading ? (
            <View style={styles.skeletonStack}>
              <Skeleton width={140} height={18} />
              <Skeleton width={160} height={12} />
            </View>
          ) : (
            <>
              <Text
                style={[styles.title, { color: colors.foreground }]}
                numberOfLines={1}
              >
                Welcome, {firstName}
              </Text>
              <Text
                style={[
                  styles.meta,
                  {
                    color: isDark
                      ? homeChrome.linkDark
                      : colors.mutedForeground,
                  },
                ]}
                numberOfLines={1}
              >
                {lastLoginLabel ?? "Tap to manage your profile"}
              </Text>
            </>
          )}
        </View>
      </Pressable>

      <View style={styles.actions}>
        <HomeNotificationBell
          variant="dot"
          iconSize={HEADER_ICON_SIZE}
          controlSize={HEADER_CONTROL_SIZE}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: HEADER_CONTROL_SIZE,
  },
  leading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  leadingPressed: {
    opacity: 0.82,
  },
  greeting: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 2,
  },
  skeletonStack: {
    gap: 6,
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    lineHeight: 24,
    letterSpacing: -0.35,
  },
  meta: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
    letterSpacing: 0.1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
