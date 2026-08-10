import { formatGhs } from "@/lib/currency";
import { StatusBadge } from "@/components/activity/StatusBadge";
import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import {
  formatActivityListMeta,
  getActivityTransactionTitle,
  isTransactionSettled,
} from "@/components/activity/transactionUtils";
import type { Transaction } from "@/lib/api";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ActivityTransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  showDivider?: boolean;
}

export function ActivityTransactionRow({
  transaction,
  onPress,
  showDivider = true,
}: ActivityTransactionRowProps) {
  const { colors } = useTheme();
  const isDeposit = transaction.type === "deposit";
  const amount = Number(transaction.amount);
  const settled = isTransactionSettled(transaction.status);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? styles.pressed : null,
        showDivider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TransactionTypeIcon kind={isDeposit ? "deposit" : "withdrawal"} />

      <View style={styles.copy}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {getActivityTransactionTitle(transaction)}
        </Text>
        <Text
          style={[styles.meta, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {formatActivityListMeta(transaction)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            {
              color: isDeposit ? colors.success : colors.foreground,
            },
          ]}
        >
          {isDeposit ? "+" : "−"}
          {formatGhs(amount)}
        </Text>
        {!settled ? <StatusBadge status={transaction.status} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 64,
  },
  pressed: {
    opacity: 0.82,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
    minWidth: 72,
  },
  amount: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.2,
  },
});
