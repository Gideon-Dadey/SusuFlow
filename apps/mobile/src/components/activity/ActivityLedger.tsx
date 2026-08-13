import { AppIcon } from "@/components/icons/AppIcon";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActivityTransactionRow } from "@/components/activity/ActivityTransactionRow";
import { searchTransactions } from "@/components/activity/transactionUtils";
import { TabSectionLabel } from "@/components/layout/TabScreen";
import type { Transaction } from "@/lib/api";
import { authChrome } from "@/theme/auth-chrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ActivityLedgerProps {
  transactions: Transaction[];
  onPressTransaction: (transaction: Transaction) => void;
}

export function ActivityLedger({
  transactions,
  onPressTransaction,
}: ActivityLedgerProps) {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => searchTransactions(transactions, query),
    [transactions, query],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <TabSectionLabel>History</TabSectionLabel>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {visible.length}
        </Text>
      </View>

      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: isDark ? authChrome.field : colors.muted,
            borderColor: isDark ? authChrome.fieldBorder : colors.border,
          },
        ]}
      >
        <AppIcon name="search" size={16} color={colors.mutedForeground} />
        <View style={styles.inputSlot}>
          {/*
            Geist + TextInput placeholders mis-kern (letters look scrambled).
            Overlay a Text so spacing matches typed text.
          */}
          {!query ? (
            <Text
              style={[styles.placeholder, { color: colors.mutedForeground }]}
              pointerEvents="none"
              numberOfLines={1}
            >
              Search transactions
            </Text>
          ) : null}
          <TextInput
            accessibilityLabel="Search transactions"
            placeholder=""
            placeholderTextColor="transparent"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
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
      </View>

      <View style={styles.menu}>
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No matching records
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Try a reference number, payment method, or amount.
            </Text>
          </View>
        ) : (
          visible.map((transaction, index) => (
            <ActivityTransactionRow
              key={transaction.id}
              transaction={transaction}
              onPress={() => onPressTransaction(transaction)}
              showDivider={index < visible.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  count: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    marginBottom: 4,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inputSlot: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    minHeight: 44,
  },
  placeholder: {
    position: "absolute",
    left: 0,
    right: 0,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    letterSpacing: 0,
    lineHeight: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    letterSpacing: 0,
    paddingVertical: 12,
    includeFontPadding: false,
  },
  menu: {
    marginHorizontal: -spacing.lg,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: 6,
    alignItems: "center",
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
