import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { AppIcon } from "@/components/icons/AppIcon";
import { TabSectionLabel } from "@/components/layout/TabScreen";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@/lib/currency";
import { StatusBadge } from "@/components/activity/StatusBadge";
import {
  formatActivityListMeta,
  getActivityTransactionTitle,
} from "@/components/activity/transactionUtils";
import type { Transaction } from "@/lib/api";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ActivityAttentionQueueProps {
  items: Transaction[];
  onPressTransaction: (transaction: Transaction) => void;
}

export function ActivityAttentionQueue({
  items,
  onPressTransaction,
}: ActivityAttentionQueueProps) {
  const { colors, isDark } = useTheme();
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <TabSectionLabel>Needs attention</TabSectionLabel>
        <Text style={[styles.countText, { color: colors.warning }]}>
          {items.length}
        </Text>
      </View>

      <View style={styles.menu}>
        {items.map((transaction, index) => {
          const isDeposit = transaction.type === "deposit";
          const amount = Number(transaction.amount);

          return (
            <View key={transaction.id}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onPressTransaction(transaction)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
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
                  size={16}
                  color={
                    isDark ? bankChrome.chevronDark : colors.mutedForeground
                  }
                />
              </Pressable>
              {index < items.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: divider }]} />
              ) : null}
            </View>
          );
        })}
      </View>
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
    justifyContent: "space-between",
  },
  countText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    marginBottom: 4,
  },
  menu: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg + 42 + spacing.md,
  },
});
