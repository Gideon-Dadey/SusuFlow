import { StyleSheet, Text, View } from "react-native";
import { getHomeGreeting } from "@/components/home/homeUtils";
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
  const { colors } = useTheme();
  const openOptions = useUiStore((s) => s.openOptions);
  const { displayName, initials, isLoading } = useProfileData();
  const firstName = displayName.split(/\s+/)[0] || "Member";

  return (
    <View style={styles.row}>
      <View style={styles.leading}>
        <UserAvatar
          initials={initials}
          seed={displayName}
          size="sm"
          loading={isLoading}
        />

        <View style={styles.greeting}>
          {isLoading ? (
            <Skeleton width={148} height={20} />
          ) : (
            <Text
              style={[styles.title, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {getHomeGreeting(firstName)}
            </Text>
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
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
