import { HomeSectionTitle } from "@/components/home/HomeSectionTitle";
import { CardSurface } from "@/components/ui/CardSurface";
import { TransactionTypeIcon } from "@/components/activity/TransactionTypeIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@/lib/currency";
import {
  formatHomeActivityDate,
  getHomeTransactionTitle,
} from "@/components/home/homeUtils";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface HomeRecentActivityProps {
  transactions: Transaction[];
  totalCount: number;
  groupName: string;
  onViewAll: () => void;
  onPressTransaction?: (transaction: Transaction) => void;
}

const PREVIEW_LIMIT = 3;

export function HomeRecentActivity({
  transactions,
  totalCount,
  groupName,
  onViewAll,
  onPressTransaction,
}: HomeRecentActivityProps) {
  const { colors } = useTheme();
  const preview = transactions.slice(0, PREVIEW_LIMIT);

  return (
    <View style={styles.section}>
      <HomeSectionTitle
        title="Recent activity"
        right={
          totalCount > 0 ? (
            <Pressable onPress={onViewAll} hitSlop={10}>
              <Text style={[styles.viewAll, { color: colors.mutedForeground }]}>
                See all
              </Text>
            </Pressable>
          ) : null
        }
      />

      <CardSurface innerStyle={styles.listCard}>
        {preview.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Nothing here yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Your deposits and withdrawals will show up here.
            </Text>
          </View>
        ) : (
          preview.map((transaction, index) => {
            const isDeposit = transaction.type === "deposit";
            const amount = Number(transaction.amount);

            return (
              <Pressable
                key={transaction.id}
                accessibilityRole="button"
                onPress={() => onPressTransaction?.(transaction)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && onPressTransaction ? styles.pressed : null,
                  index < preview.length - 1 && {
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
                    style={[styles.title, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {getHomeTransactionTitle(transaction)}
                  </Text>
                  <Text
                    style={[styles.meta, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {formatHomeActivityDate(transaction.createdAt)}
                    {groupName ? ` · ${groupName}` : ""}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.amount,
                    {
                      color: isDeposit ? colors.primary : colors.foreground,
                    },
                  ]}
                >
                  {isDeposit ? "+" : "−"}
                  {formatGhs(amount)}
                </Text>
              </Pressable>
            );
          })
        )}
      </CardSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  viewAll: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  listCard: {
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
  amount: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.sm,
    letterSpacing: -0.2,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  emptyText: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    lineHeight: 18,
  },
});
