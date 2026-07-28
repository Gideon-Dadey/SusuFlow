import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityAttentionQueue } from "@/components/activity/ActivityAttentionQueue";
import { ActivityCashFlowPanel } from "@/components/activity/ActivityCashFlowPanel";
import { ActivityEmptyState } from "@/components/activity/ActivityEmptyState";
import { ActivityFilterBar } from "@/components/activity/ActivityFilterBar";
import { ActivityLedger } from "@/components/activity/ActivityLedger";
import { ActivityPeriodSelector } from "@/components/activity/ActivityPeriodSelector";
import { TransactionReceiptSheet } from "@/components/activity/TransactionReceiptSheet";
import {
  computeActivityPeriodInsights,
  filterTransactions,
  filterTransactionsByPeriod,
  getAttentionTransactions,
  type ActivityFilter,
  type ActivityPeriod,
} from "@/components/activity/transactionUtils";
import {
  TabScreenLayout,
  TabScreenHeader,
} from "@/components/layout/TabScreen";
import { ActivityScreenSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import type { Transaction } from "@/lib/api";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { spacing } from "@/theme/tokens";

export default function ActivityScreen() {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [period, setPeriod] = useState<ActivityPeriod>("this_month");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { sessionKey } = useCustomerSession();

  const { data: deposits, isPending: depositsPending } = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () => fetchCustomerDeposits(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const { data: withdrawals, isPending: withdrawalsPending } = useQuery({
    queryKey: sessionKey
      ? queryKeys.withdrawals(sessionKey.userId, sessionKey.customerId)
      : ["withdrawals", "inactive"],
    queryFn: () => fetchCustomerWithdrawals(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const allTransactions = useMemo(
    () =>
      [...(deposits?.items || []), ...(withdrawals?.items || [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [deposits?.items, withdrawals?.items],
  );

  const periodTransactions = useMemo(
    () => filterTransactionsByPeriod(allTransactions, period),
    [allTransactions, period],
  );

  const filtered = useMemo(
    () => filterTransactions(periodTransactions, filter),
    [periodTransactions, filter],
  );

  const insights = useMemo(
    () => computeActivityPeriodInsights(allTransactions, period),
    [allTransactions, period],
  );

  const attentionItems = useMemo(
    () => getAttentionTransactions(filtered),
    [filtered],
  );

  const ledgerTransactions = useMemo(() => {
    if (attentionItems.length === 0) return filtered;
    const attentionIds = new Set(attentionItems.map((t) => t.id));
    return filtered.filter((t) => !attentionIds.has(t.id));
  }, [filtered, attentionItems]);

  const showSkeleton =
    (depositsPending && deposits === undefined) ||
    (withdrawalsPending && withdrawals === undefined);

  const openReceipt = (transaction: Transaction) => {
    setSelectedTxn(transaction);
    setReceiptOpen(true);
  };

  const closeReceipt = () => {
    setReceiptOpen(false);
    setSelectedTxn(null);
  };

  const hasAnyTransactions = allTransactions.length > 0;

  return (
    <>
      <TabScreenLayout header={<TabScreenHeader title="Activity" />}>
        {showSkeleton ? (
          <ActivityScreenSkeleton />
        ) : !hasAnyTransactions ? (
          <ActivityEmptyState filter="all" />
        ) : (
          <View style={styles.content}>
            <ActivityPeriodSelector value={period} onChange={setPeriod} />

            <ActivityCashFlowPanel insights={insights} />

            <ActivityFilterBar value={filter} onChange={setFilter} />

            <ActivityAttentionQueue
              items={attentionItems}
              onPressTransaction={openReceipt}
            />

            {filtered.length === 0 ? (
              <ActivityEmptyState filter={filter} />
            ) : ledgerTransactions.length === 0 ? null : (
              <ActivityLedger
                transactions={ledgerTransactions}
                onPressTransaction={openReceipt}
              />
            )}
          </View>
        )}
      </TabScreenLayout>

      <TransactionReceiptSheet
        transaction={selectedTxn}
        visible={receiptOpen}
        onClose={closeReceipt}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
});
