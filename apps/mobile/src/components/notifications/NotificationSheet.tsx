import { AppIcon } from "@/components/icons/AppIcon";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatGhs } from "@/lib/currency";
import { StatusBadge } from "@/components/activity/StatusBadge";
import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { NotificationBellIcon } from "@/components/notifications/NotificationBellIcon";
import { Button } from "@/components/Button";
import type { AppNotification } from "@/hooks/useNotificationFeed";
import { formatNotificationTime } from "@/lib/notification-utils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface NotificationSheetProps {
  visible: boolean;
  items: AppNotification[];
  loading: boolean;
  error: boolean;
  /** ISO cutoff used to render unread dots for this session. */
  readCutoff: string | null;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (item: AppNotification) => void;
}

function isUnread(item: AppNotification, readCutoff: string | null) {
  if (item.inboxId) return !item.readAt;
  if (!readCutoff) return false;
  return new Date(item.createdAt).getTime() > new Date(readCutoff).getTime();
}

function NotificationRow({
  item,
  unread,
  onPress,
}: {
  item: AppNotification;
  unread: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}. ${unread ? "Unread. " : ""}Open details`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.border,
          backgroundColor: unread
            ? isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(15,23,42,0.03)"
            : "transparent",
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.leading}>
        <TransactionTypeIcon kind={item.kind} />
        {unread ? (
          <View
            style={[styles.unreadDot, { backgroundColor: colors.primary }]}
          />
        ) : null}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[
              styles.rowTitle,
              {
                color: colors.foreground,
                fontFamily: unread
                  ? typography.fontFamily.bold
                  : typography.fontFamily.semibold,
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {typeof item.amount === "number" &&
          (item.kind === "deposit" || item.kind === "withdrawal") ? (
            <Text style={[styles.rowAmount, { color: colors.foreground }]}>
              {formatGhs(item.amount)}
            </Text>
          ) : null}
        </View>
        <Text
          style={[styles.rowCopy, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {item.body}
        </Text>
        <View style={styles.rowMeta}>
          <StatusBadge status={item.status} />
          <Text style={[styles.rowTime, { color: colors.mutedForeground }]}>
            {formatNotificationTime(item.createdAt)}
          </Text>
          <Text style={[styles.rowAction, { color: colors.primary }]}>
            View
          </Text>
        </View>
      </View>
      <AppIcon name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function NotificationSheet({
  visible,
  items,
  loading,
  error,
  readCutoff,
  onClose,
  onRetry,
  onSelect,
}: NotificationSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.heading }]}>
                Notifications
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
              >
                Payments, identity, and security — tap to open
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={12}
            >
              <AppIcon
                name="close"
                size={20}
                color={colors.mutedForeground}
                weight="bold"
              />
            </Pressable>
          </View>

          {loading && items.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Loading activity…
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <NotificationBellIcon size={32} color={colors.mutedForeground} />
              <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                Could not load notifications
              </Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Check your connection and try again.
              </Text>
              <Button title="Retry" onPress={onRetry} variant="outline" />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.centered}>
              <NotificationBellIcon size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                You&apos;re all caught up
              </Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Payments, payouts, and security alerts will land here the moment
                they happen.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  unread={isUnread(item, readCutoff)}
                  onPress={() => onSelect(item)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "78%",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leading: {
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  rowBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontSize: typography.size.sm,
  },
  rowAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
  },
  rowCopy: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  rowTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    flex: 1,
  },
  rowAction: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
  },
  errorTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
