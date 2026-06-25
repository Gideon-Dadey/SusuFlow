import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { AppIcon } from "@/components/icons/AppIcon";
import { CardSurface } from "@/components/ui/CardSurface";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@/lib/currency";
import { StatusBadge } from "@/components/activity/StatusBadge";
import {
  formatActivityListMeta,
  getActivityTransactionTitle,
} from "@/components/activity/transactionUtils";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface ActivityAttentionQueueProps {
  items: Transaction[];
  onPressTransaction: (transaction: Transaction) => void;
}

export function ActivityAttentionQueue({
  items,
  onPressTransaction,
}: ActivityAttentionQueueProps) {
  const { colors } = useTheme();

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <AppIcon name="alert-circle" size={14} color={colors.warning} />
        <Text style={[styles.title, { color: colors.foreground }]}>
          Requires attention
        </Text>
        <View style={[styles.count, { backgroundColor: colors.muted }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {items.length}
          </Text>
        </View>
      </View>

      <CardSurface innerStyle={styles.card}>
        {items.map((transaction, index) => {
          const isDeposit = transaction.type === "deposit";
          const amount = Number(transaction.amount);

          return (
            <Pressable
              key={transaction.id}
              accessibilityRole="button"
              onPress={() => onPressTransaction(transaction)}
              style={({ pressed }) => [
                styles.row,
                pressed && styles.pressed,
                index < items.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <TransactionTypeIcon
                kind={isDeposit ? "deposit" : "withdrawal"}
              />
              <View style={styles.copy}>
                <Text
                  style={[styles.rowTitle, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {getActivityTransactionTitle(transaction)}
                </Text>
                <Text
                  style={[styles.rowMeta, { color: colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {formatActivityListMeta(transaction)}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.foreground }]}>
                  {isDeposit ? "+" : "−"}
                  {formatGhs(amount)}
                </Text>
                <StatusBadge status={transaction.status} />
              </View>
              <AppIcon
                name="chevron-right"
                size={14}
                color={colors.mutedForeground}
              />
            </Pressable>
          );
        })}
      </CardSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 2,
  },
  title: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  count: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
  },
  card: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    minHeight: 60,
  },
  pressed: {
    opacity: 0.82,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  rowMeta: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  right: {
    alignItems: "flex-end",
    gap: 5,
  },
  amount: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.15,
  },
});
