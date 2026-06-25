import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
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
import { TransactionReceiptSheet } from "@/components/activity/TransactionReceiptSheet";
import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { NotificationBellIcon } from "@/components/notifications/NotificationBellIcon";
import { Button } from "@/components/Button";
import type { AppNotification } from "@/hooks/useNotificationFeed";
import { formatNotificationTime } from "@/lib/notification-utils";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface NotificationSheetProps {
  visible: boolean;
  items: AppNotification[];
  loading: boolean;
  error: boolean;
  onClose: () => void;
  onRetry: () => void;
}

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <TransactionTypeIcon kind={item.kind} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.rowAmount, { color: colors.foreground }]}>
            {formatGhs(item.amount)}
          </Text>
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
        </View>
      </View>
    </Pressable>
  );
}

export function NotificationSheet({
  visible,
  items,
  loading,
  error,
  onClose,
  onRetry,
}: NotificationSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const openReceipt = (item: AppNotification) => {
    setSelectedTxn(item.transaction);
    setReceiptOpen(true);
  };

  const closeReceipt = () => {
    setReceiptOpen(false);
    setSelectedTxn(null);
  };

  return (
    <>
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
              <Text style={[styles.title, { color: colors.heading }]}>
                Notifications
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                hitSlop={12}
              >
                <FontAwesome6
                  name="xmark"
                  size={20}
                  color={colors.mutedForeground}
                  solid
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
                <NotificationBellIcon
                  size={32}
                  color={colors.mutedForeground}
                />
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
                <NotificationBellIcon
                  size={32}
                  color={colors.mutedForeground}
                />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No activity yet
                </Text>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Deposits and withdrawals will appear here as they happen.
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
                    onPress={() => openReceipt(item)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <TransactionReceiptSheet
        transaction={selectedTxn}
        visible={receiptOpen}
        onClose={closeReceipt}
      />
    </>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
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
