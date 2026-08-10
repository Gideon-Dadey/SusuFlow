import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
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
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { ActivityScreenSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import type { Transaction } from "@/lib/api";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useDeepLinkStore } from "@/stores/deep-link.store";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

export default function ActivityScreen() {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [period, setPeriod] = useState<ActivityPeriod>("this_month");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const consumePendingReceipt = useDeepLinkStore(
    (s) => s.consumePendingReceipt,
  );
  const pendingReceipt = useDeepLinkStore((s) => s.pendingReceipt);

  const { sessionKey } = useCustomerSession();

  const depositsQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () => fetchCustomerDeposits(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const withdrawalsQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.withdrawals(sessionKey.userId, sessionKey.customerId)
      : ["withdrawals", "inactive"],
    queryFn: () => fetchCustomerWithdrawals(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const deposits = depositsQuery.data;
  const withdrawals = withdrawalsQuery.data;
  const depositsPending = depositsQuery.isPending;
  const withdrawalsPending = withdrawalsQuery.isPending;

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

  const showError =
    (depositsQuery.isError && deposits === undefined) ||
    (withdrawalsQuery.isError && withdrawals === undefined);

  const openReceipt = useCallback((transaction: Transaction) => {
    setSelectedTxn(transaction);
    setReceiptOpen(true);
  }, []);

  const closeReceipt = () => {
    setReceiptOpen(false);
    setSelectedTxn(null);
  };

  useEffect(() => {
    if (!pendingReceipt) return;
    const pending = consumePendingReceipt();
    if (pending) openReceipt(pending);
  }, [pendingReceipt, consumePendingReceipt, openReceipt]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
      await Promise.all([depositsQuery.refetch(), withdrawalsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [depositsQuery, queryClient, sessionKey, withdrawalsQuery]);

  const hasAnyTransactions = allTransactions.length > 0;

  return (
    <>
      <TabScreenLayout
        bankHeader
        header={<TabScreenHeader title="Activity" onGeometry />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          <OfflineBanner />

          {showSkeleton ? (
            <ActivityScreenSkeleton />
          ) : showError ? (
            <QueryErrorState
              title="Couldn’t load activity"
              message="Your transactions couldn’t be fetched. This is not an empty wallet — try again."
              onRetry={() => void onRefresh()}
            />
          ) : !hasAnyTransactions ? (
            <ActivityEmptyState filter="all" />
          ) : (
            <>
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
            </>
          )}
        </View>
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
