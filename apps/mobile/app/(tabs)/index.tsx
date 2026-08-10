import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { TransactionReceiptSheet } from "@/components/activity/TransactionReceiptSheet";
import { HomeActionGrid } from "@/components/home/HomeActionGrid";
import { HomeBalanceCard } from "@/components/home/HomeBalanceCard";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeKycBanner } from "@/components/home/HomeKycBanner";
import { HomePromoCarousel } from "@/components/home/HomePromoCarousel";
import { HomeRecentActivity } from "@/components/home/HomeRecentActivity";
import { TabScreenLayout } from "@/components/layout/TabScreen";
import { useProfileData } from "@/components/settings/useProfileData";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { HomeBalanceSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import type { Transaction } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { Button } from "@/components/Button";

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { groupName, logoUrl, refetch: refetchBranding } = useProfileData();
  const { sessionKey, isProfileReady, profileQuery } = useCustomerSession();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: wallet,
    isPending: walletPending,
    isError: walletError,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: sessionKey
      ? queryKeys.wallet(sessionKey.userId, sessionKey.customerId)
      : ["wallet", "inactive"],
    queryFn: () => fetchCustomerWallet(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const { data: deposits, refetch: refetchDeposits } = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () => fetchCustomerDeposits(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const { data: withdrawals, refetch: refetchWithdrawals } = useQuery({
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

  const showBalanceSkeleton =
    !isProfileReady || !sessionKey || (walletPending && wallet === undefined);

  const showBalanceError = walletError && wallet === undefined;

  const openReceipt = (transaction: Transaction) => {
    setSelectedTxn(transaction);
    setReceiptOpen(true);
  };

  const closeReceipt = () => {
    setReceiptOpen(false);
    setSelectedTxn(null);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
      await Promise.all([
        profileQuery.refetch(),
        refetchWallet(),
        refetchDeposits(),
        refetchWithdrawals(),
        refetchBranding(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    profileQuery,
    queryClient,
    refetchBranding,
    refetchDeposits,
    refetchWallet,
    refetchWithdrawals,
    sessionKey,
  ]);

  return (
    <>
      <TabScreenLayout
        header={<HomeHeader />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
          />
        }
      >
        <OfflineBanner />
        {profileQuery.isError ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>
              Could not load your account
            </Text>
            <Text style={[styles.errorCopy, { color: colors.mutedForeground }]}>
              Check your connection and try again.
            </Text>
            <Button
              title="Retry"
              variant="outline"
              onPress={() => profileQuery.refetch()}
            />
          </View>
        ) : showBalanceSkeleton ? (
          <View
            style={[
              styles.balanceSkeletonWrap,
              { backgroundColor: colors.muted },
            ]}
          >
            <HomeBalanceSkeleton />
          </View>
        ) : showBalanceError ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>
              Could not load balance
            </Text>
            <Button
              title="Retry"
              variant="outline"
              onPress={() => refetchWallet()}
            />
          </View>
        ) : (
          <HomeBalanceCard
            balance={wallet?.balance ?? 0}
            groupName={groupName}
            logoUrl={logoUrl}
            transactions={allTransactions}
          />
        )}

        <HomeKycBanner />

        <HomePromoCarousel
          groupName={groupName}
          onDeposit={() => router.push("/(tabs)/deposit")}
          onGoals={() => router.push("/(tabs)/plans")}
          onActivity={() => router.push("/(tabs)/activity")}
        />

        <HomeActionGrid
          onViewAll={() => router.push("/(tabs)/profile")}
          actions={[
            {
              label: "Deposit",
              icon: "deposit",
              onPress: () => router.push("/(tabs)/deposit"),
            },
            {
              label: "Withdraw",
              icon: "withdraw",
              onPress: () => router.push("/(tabs)/withdraw"),
            },
            {
              label: "Goals",
              icon: "goals",
              onPress: () => router.push("/(tabs)/plans"),
            },
            {
              label: "Activity",
              icon: "activity",
              onPress: () => router.push("/(tabs)/activity"),
            },
          ]}
        />

        <HomeRecentActivity
          transactions={allTransactions}
          totalCount={allTransactions.length}
          groupName={groupName}
          onViewAll={() => router.push("/(tabs)/activity")}
          onPressTransaction={openReceipt}
        />
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
  balanceSkeletonWrap: {
    overflow: "hidden",
    borderRadius: radius.lg,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  errorCopy: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
  },
});
