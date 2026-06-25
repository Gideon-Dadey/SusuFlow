import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationSheet } from "@/components/notifications/NotificationSheet";
import { NotificationBellIcon } from "@/components/notifications/NotificationBellIcon";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { useScopedCustomerId } from "@/hooks/useScopedCustomerId";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

export function HomeNotificationBell({
  variant = "count",
  iconSize = 20,
  controlSize = 44,
}: {
  variant?: "count" | "dot";
  iconSize?: number;
  controlSize?: number;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const customerId = useScopedCustomerId();
  const { items, unreadCount, isLoading, isError, refetch, markAllRead } =
    useNotificationFeed(customerId);

  const openSheet = () => {
    setOpen(true);
    void markAllRead();
  };

  const badgeLabel =
    unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onPress={openSheet}
        hitSlop={10}
        style={({ pressed }) => [
          styles.button,
          { width: controlSize, height: controlSize },
          pressed && styles.pressed,
        ]}
      >
        <NotificationBellIcon size={iconSize} color={colors.heading} />
        {variant === "dot" && unreadCount > 0 ? (
          <View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                top: controlSize * 0.2,
                right: controlSize * 0.2,
              },
            ]}
          />
        ) : null}
        {variant === "count" && badgeLabel ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text
              style={[styles.badgeText, { color: colors.primaryForeground }]}
            >
              {badgeLabel}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <NotificationSheet
        visible={open}
        items={items}
        loading={isLoading}
        error={isError}
        onClose={() => setOpen(false)}
        onRetry={() => void refetch()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
  },
});
