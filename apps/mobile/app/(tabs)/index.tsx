import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HomeActionGrid } from "@/components/home/HomeActionGrid";
import { HomeBalanceCard } from "@/components/home/HomeBalanceCard";
import { HomeDepositButton } from "@/components/home/HomeDepositButton";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomePromoCarousel } from "@/components/home/HomePromoCarousel";
import { HomeRecentActivity } from "@/components/home/HomeRecentActivity";
import { TabScreenLayout } from "@/components/layout/TabScreen";
import { useProfileData } from "@/components/settings/useProfileData";
import { HomeBalanceSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useRefreshFinancialsOnFocus } from "@/hooks/useRefreshFinancialsOnFocus";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import { depositApi, withdrawalApi } from "@/lib/api";
import { financialQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { Button } from "@/components/Button";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { groupName } = useProfileData();
  const { sessionKey, isProfileReady, profileQuery } = useCustomerSession();

  useRefreshFinancialsOnFocus(sessionKey);

  const {
    data: wallet,
    isPending: walletPending,
    isFetching: walletFetching,
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

  const { data: deposits } = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () =>
      depositApi.list({ customer_id: sessionKey!.customerId, limit: 100 }),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const { data: withdrawals } = useQuery({
    queryKey: sessionKey
      ? queryKeys.withdrawals(sessionKey.userId, sessionKey.customerId)
      : ["withdrawals", "inactive"],
    queryFn: () =>
      withdrawalApi.list({ customer_id: sessionKey!.customerId, limit: 100 }),
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
    !isProfileReady ||
    !sessionKey ||
    walletPending ||
    (walletFetching && wallet === undefined);

  const showBalanceError = walletError && !walletFetching && !walletPending;

  return (
    <TabScreenLayout header={<HomeHeader />}>
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
          transactions={allTransactions}
        />
      )}

      <HomePromoCarousel
        groupName={groupName}
        onDeposit={() => router.push("/(tabs)/deposit")}
        onGoals={() => router.push("/(tabs)/plans")}
        onActivity={() => router.push("/(tabs)/activity")}
      />

      <HomeDepositButton onPress={() => router.push("/(tabs)/deposit")} />

      <HomeActionGrid
        actions={[
          {
            label: "Deposit History",
            subtitle: "View all deposits",
            icon: "receipt",
            onPress: () => router.push("/(tabs)/activity"),
          },
          {
            label: "Savings goals",
            subtitle: "Track your targets",
            icon: "target",
            onPress: () => router.push("/(tabs)/plans"),
          },
          {
            label: "Withdraw",
            subtitle: "Request a withdrawal",
            icon: "arrow-up-right",
            onPress: () => router.push("/(tabs)/withdraw"),
          },
          {
            label: "Statements",
            subtitle: "View your statements",
            icon: "file-text",
            onPress: () => router.push("/transactions"),
          },
        ]}
      />

      <HomeRecentActivity
        transactions={allTransactions}
        totalCount={allTransactions.length}
        groupName={groupName}
        onViewAll={() => router.push("/(tabs)/activity")}
      />
    </TabScreenLayout>
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
