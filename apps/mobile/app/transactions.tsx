import { useQuery } from "@tanstack/react-query";
import { StyleSheet, Text } from "react-native";
import { TransactionRow } from "@/components/TransactionRow";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { TransactionListSkeleton } from "@/components/ui/Skeleton";
import { useRefreshFinancialsOnFocus } from "@/hooks/useRefreshFinancialsOnFocus";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { depositApi, withdrawalApi } from "@/lib/api";
import { financialQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

export default function TransactionsScreen() {
  const { colors } = useTheme();

  const { sessionKey } = useCustomerSession();

  useRefreshFinancialsOnFocus(sessionKey);

  const { data: deposits, isLoading: dLoading } = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () => depositApi.list({ customer_id: sessionKey!.customerId }),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const { data: withdrawals, isLoading: wLoading } = useQuery({
    queryKey: sessionKey
      ? queryKeys.withdrawals(sessionKey.userId, sessionKey.customerId)
      : ["withdrawals", "inactive"],
    queryFn: () => withdrawalApi.list({ customer_id: sessionKey!.customerId }),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const transactions = [
    ...(deposits?.items || []),
    ...(withdrawals?.items || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const isLoading = dLoading || wLoading || !sessionKey;

  return (
    <SettingsDetailLayout title="Transaction History">
      {isLoading ? (
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
