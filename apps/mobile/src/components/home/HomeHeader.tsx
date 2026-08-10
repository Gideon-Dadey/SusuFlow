import { StyleSheet, Text, View } from "react-native";
import { getHomeTimeGreeting } from "@/components/home/homeUtils";
import { homeChrome } from "@/components/home/homeChrome";
import { HomeNotificationBell } from "@/components/notifications/HomeNotificationBell";
import { OptionsMenuButton } from "@/components/navigation/OptionsMenuButton";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProfileData } from "@/components/settings/useProfileData";
import { useUiStore } from "@/stores/ui.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

const HEADER_CONTROL_SIZE = 44;
const HEADER_ICON_SIZE = 20;

export function HomeHeader() {
  const { colors, isDark } = useTheme();
  const openOptions = useUiStore((s) => s.openOptions);
  const { displayName, initials, isLoading, avatarUrl } = useProfileData();
  const firstName = displayName.split(/\s+/)[0] || "there";

  return (
    <View style={styles.row}>
      <View style={styles.leading}>
        <UserAvatar
          initials={initials}
          seed={displayName}
          imageUrl={avatarUrl}
          size="sm"
          loading={isLoading}
        />

        <View style={styles.greeting}>
          {isLoading ? (
            <View style={styles.skeletonStack}>
              <Skeleton width={100} height={12} />
              <Skeleton width={140} height={20} />
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.eyebrow,
                  {
                    color: isDark ? homeChrome.linkDark : homeChrome.link,
                  },
                ]}
                numberOfLines={1}
              >
                {getHomeTimeGreeting()}
              </Text>
              <Text
                style={[styles.title, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {firstName}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <HomeNotificationBell
          variant="dot"
          iconSize={HEADER_ICON_SIZE}
          controlSize={HEADER_CONTROL_SIZE}
        />
        <OptionsMenuButton
          onPress={openOptions}
          showStatusDot={false}
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
  greeting: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 2,
  },
  skeletonStack: {
    gap: 6,
  },
  eyebrow: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    lineHeight: 24,
    letterSpacing: -0.35,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
