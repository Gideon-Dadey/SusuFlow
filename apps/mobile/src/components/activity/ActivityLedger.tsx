import { AppIcon } from "@/components/icons/AppIcon";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActivityTransactionRow } from "@/components/activity/ActivityTransactionRow";
import { searchTransactions } from "@/components/activity/transactionUtils";
import { CardSurface } from "@/components/ui/CardSurface";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface ActivityLedgerProps {
  transactions: Transaction[];
  onPressTransaction: (transaction: Transaction) => void;
}

export function ActivityLedger({
  transactions,
  onPressTransaction,
}: ActivityLedgerProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => searchTransactions(transactions, query),
    [transactions, query],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Transaction ledger
        </Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {visible.length} record{visible.length === 1 ? "" : "s"}
        </Text>
      </View>

      <CardSurface innerStyle={styles.searchWrap}>
        <AppIcon name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          accessibilityLabel="Search transactions"
          placeholder="Search reference, method, or amount"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            hitSlop={8}
          >
            <AppIcon name="close" size={14} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </CardSurface>

      {visible.length === 0 ? (
        <CardSurface innerStyle={styles.emptyCard}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No matching records
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            Try a reference number, payment method, or amount.
          </Text>
        </CardSurface>
      ) : (
        <CardSurface innerStyle={styles.card}>
          {visible.map((transaction, index) => (
            <ActivityTransactionRow
              key={transaction.id}
              transaction={transaction}
              onPress={() => onPressTransaction(transaction)}
              showDivider={index < visible.length - 1}
            />
          ))}
        </CardSurface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.md,
    marginLeft: 2,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  count: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    paddingVertical: 10,
  },
  card: {
    overflow: "hidden",
  },
  emptyCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  emptyBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    lineHeight: 18,
  },
});
