import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@susuflow/shared/client";
import { Transaction } from "@/lib/api";
import { colors, radius, typography } from "@/theme/tokens";

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const isCredit = transaction.type === "deposit";
  const amount = Number(transaction.amount);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isCredit ? "#dcfce7" : "#fee2e2" },
        ]}
      >
        <Feather
          name={isCredit ? "arrow-down-left" : "arrow-up-right"}
          size={18}
          color={isCredit ? colors.primary700 : colors.destructive}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.description || (isCredit ? "Deposit" : "Withdrawal")}
        </Text>
        <Text style={styles.meta}>
          {new Date(transaction.createdAt).toLocaleString("en-GH", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: isCredit ? colors.primary700 : colors.destructive },
          ]}
        >
          {isCredit ? "+" : "-"}
          {formatGhs(amount)}
        </Text>
        <Text style={styles.status}>{transaction.status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.mutedForeground,
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  status: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: colors.mutedForeground,
    textTransform: "capitalize",
  },
});
