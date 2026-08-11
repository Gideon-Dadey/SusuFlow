import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TransactionReceiptSheet } from "@/components/activity/TransactionReceiptSheet";
import { NotificationSheet } from "@/components/notifications/NotificationSheet";
import { NotificationBellIcon } from "@/components/notifications/NotificationBellIcon";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { useScopedCustomerId } from "@/hooks/useScopedCustomerId";
import type { AppNotification } from "@/types/notification";
import type { Transaction } from "@/lib/api";
import { hrefForNotificationRoute } from "@/lib/notification-routing";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

const RECEIPT_OPEN_DELAY_MS = 280;

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
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [readCutoff, setReadCutoff] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const customerId = useScopedCustomerId();
  const {
    items,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAllRead,
    lastSeenAt,
  } = useNotificationFeed(customerId);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, []);

  const clearOpenTimer = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const openSheet = () => {
    setReadCutoff(lastSeenAt);
    setSheetOpen(true);
    void markAllRead();
  };

  const closeSheet = () => {
    setSheetOpen(false);
  };

  const openReceipt = useCallback((transaction: Transaction) => {
    clearOpenTimer();
    // Close notifications Modal first — nested Modals fail silently on device.
    setSheetOpen(false);
    openTimerRef.current = setTimeout(() => {
      setSelectedTxn(transaction);
      setReceiptOpen(true);
      openTimerRef.current = null;
    }, RECEIPT_OPEN_DELAY_MS);
  }, []);

  const handleSelect = (item: AppNotification) => {
    if (item.transaction) {
      openReceipt(item.transaction);
      return;
    }
    setSheetOpen(false);
    if (item.kind === "kyc") {
      router.push(hrefForNotificationRoute("kyc"));
      return;
    }
    if (item.kind === "security") {
      router.push(hrefForNotificationRoute("security"));
      return;
    }
    router.push(hrefForNotificationRoute("activity"));
  };

  const closeReceipt = () => {
    setReceiptOpen(false);
    setSelectedTxn(null);
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
        visible={sheetOpen}
        items={items}
        loading={isLoading}
        error={isError}
        readCutoff={readCutoff}
        onClose={closeSheet}
        onRetry={() => void refetch()}
        onSelect={handleSelect}
      />

      <TransactionReceiptSheet
        transaction={selectedTxn}
        visible={receiptOpen}
        onClose={closeReceipt}
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
