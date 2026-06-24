import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatGhs } from "@susuflow/shared/client";
import { colors, radius, shadows, typography } from "@/theme/tokens";

interface BalanceCardProps {
  balance: number;
  todayChange?: number;
  onDeposit: () => void;
}

export function BalanceCard({
  balance,
  todayChange = 0,
  onDeposit,
}: BalanceCardProps) {
  const [visible, setVisible] = useState(true);

  return (
    <LinearGradient
      colors={[colors.brandDark, colors.primary800, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, shadows.elevated]}
    >
      <View style={styles.topRow}>
        <Text style={styles.label}>Total Savings</Text>
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={12}
          accessibilityLabel={visible ? "Hide balance" : "Show balance"}
        >
          <Feather
            name={visible ? "eye" : "eye-off"}
            size={18}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>
      </View>

      <Text style={styles.amount}>
        {visible ? formatGhs(balance) : "••••••"}
      </Text>

      {todayChange > 0 ? (
        <View style={styles.changeRow}>
          <Feather name="trending-up" size={14} color="#86efac" />
          <Text style={styles.changeText}>
            +{todayChange.toFixed(2)} GHS today
          </Text>
        </View>
      ) : null}

      <Pressable onPress={onDeposit} style={styles.depositBtn}>
        <Text style={styles.depositLabel}>Make a Deposit</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: 20,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: "rgba(255,255,255,0.75)",
  },
  amount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xxl,
    color: colors.primaryForeground,
    letterSpacing: -0.5,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  changeText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    color: "#86efac",
  },
  depositBtn: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  depositLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.primary700,
  },
});
