import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { TransactionRow } from "@/components/TransactionRow";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { TransactionListSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

export default function TransactionsScreen() {
  const { colors } = useTheme();

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

  const transactions = [
    ...(deposits?.items || []),
    ...(withdrawals?.items || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const showSkeleton =
    !sessionKey ||
    (depositsPending && deposits === undefined) ||
    (withdrawalsPending && withdrawals === undefined);

  return (
    <SettingsDetailLayout title="Transaction History">
      {showSkeleton ? (
        <TransactionListSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          No transactions yet
        </Text>
      ) : (
        transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
      )}
    </SettingsDetailLayout>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    textAlign: "center",
    paddingVertical: 24,
  },
});
