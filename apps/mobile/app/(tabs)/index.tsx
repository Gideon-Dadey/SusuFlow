import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BalanceCard } from "@/components/BalanceCard";
import { Card } from "@/components/Card";
import { QuickActionGrid } from "@/components/QuickActionGrid";
import { Screen } from "@/components/Screen";
import { TransactionRow } from "@/components/TransactionRow";
import {
  customerApi,
  depositApi,
  Transaction,
  userApi,
  withdrawalApi,
} from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { colors, typography } from "@/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userApi.getMe(),
  });

  const customerId = profile?.customer?.id;

  const { data: wallet } = useQuery({
    queryKey: ["wallet", customerId],
    queryFn: () => customerApi.getWallet(customerId!),
    enabled: !!customerId,
  });

  const { data: deposits, isLoading: depositsLoading } = useQuery({
    queryKey: ["deposits", customerId],
    queryFn: () => depositApi.list({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["withdrawals", customerId],
    queryFn: () => withdrawalApi.list({ customer_id: customerId }),
    enabled: !!customerId,
  });

  const transactions: Transaction[] = [
    ...(deposits?.items || []),
    ...(withdrawals?.items || []),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const todayTotal = transactions
    .filter(
      (t) =>
        t.type === "deposit" &&
        t.status === "completed" &&
        new Date(t.createdAt).toDateString() === new Date().toDateString(),
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const greetingName = user?.firstName || profile?.firstName || "there";

  return (
    <Screen
      title={`Welcome back, ${greetingName}!`}
      subtitle="Save together. Grow together."
    >
      <BalanceCard
        balance={wallet?.balance || 0}
        todayChange={todayTotal}
        onDeposit={() => router.push("/(tabs)/deposit")}
      />

      <QuickActionGrid
        actions={[
          {
            label: "Deposit",
            icon: "plus-circle",
            tint: colors.primary700,
            bg: "#dcfce7",
            onPress: () => router.push("/(tabs)/deposit"),
          },
          {
            label: "Withdraw",
            icon: "arrow-up-right",
            tint: colors.destructive,
            bg: "#fee2e2",
            onPress: () => router.push("/(tabs)/withdraw"),
          },
          {
            label: "Goals",
            icon: "target",
            tint: colors.primary700,
            bg: "#dcfce7",
            onPress: () => router.push("/(tabs)/plans"),
          },
          {
            label: "History",
            icon: "file-text",
            tint: "#2563eb",
            bg: "#dbeafe",
            onPress: () => router.push("/transactions"),
          },
        ]}
      />

      <Card
        title="Recent Transactions"
        action={
          <Pressable onPress={() => router.push("/transactions")}>
            <Text style={styles.link}>View all</Text>
          </Pressable>
        }
      >
        {depositsLoading || withdrawalsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : (
          transactions
            .slice(0, 5)
            .map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingVertical: 16,
  },
});
