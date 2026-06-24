import { useQuery } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Screen } from "@/components/Screen";
import { TransactionRow } from "@/components/TransactionRow";
import { depositApi, userApi, withdrawalApi } from "@/lib/api";
import { colors, typography } from "@/theme/tokens";

export default function TransactionsScreen() {
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userApi.getMe(),
  });

  const customerId = profile?.customer?.id;

  const { data: deposits, isLoading: dLoading } = useQuery({
    queryKey: ["deposits", customerId],
    queryFn: () => depositApi.list({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const { data: withdrawals, isLoading: wLoading } = useQuery({
    queryKey: ["withdrawals", customerId],
    queryFn: () => withdrawalApi.list({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const transactions = [
    ...(deposits?.items || []),
    ...(withdrawals?.items || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Transaction History",
          headerTintColor: colors.primary,
        }}
      />
      <Screen scroll>
        {dLoading || wLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : (
          transactions.map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingVertical: 24,
  },
});
