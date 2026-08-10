import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@/lib/currency";
import { StatusBadge } from "@/components/activity/StatusBadge";
import {
  formatActivityDateShort,
  getTransactionTitle,
} from "@/components/activity/transactionUtils";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  showDivider?: boolean;
}

export function TransactionRow({
  transaction,
  onPress,
  showDivider = true,
}: TransactionRowProps) {
  const { colors } = useTheme();
  const isCredit = transaction.type === "deposit";
  const amount = Number(transaction.amount);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <TransactionTypeIcon kind={isCredit ? "deposit" : "withdrawal"} />
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {getTransactionTitle(transaction)}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatActivityDateShort(transaction.createdAt)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: isCredit ? colors.success : colors.destructive },
          ]}
        >
          {isCredit ? "+" : "-"}
          {formatGhs(amount)}
        </Text>
        <StatusBadge status={transaction.status} />
      </View>
      {onPress ? (
        <AppIcon
          name="chevron-right"
          size={16}
          color={colors.mutedForeground}
          style={styles.chevron}
        />
      ) : null}
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    position: "relative",
  },
  pressed: {
    opacity: 0.82,
  },
  content: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  meta: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  chevron: {
    marginLeft: -4,
  },
  divider: {
    position: "absolute",
    left: spacing.md + 40 + spacing.md,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
