import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  QUICK_WITHDRAW_FRACTIONS,
  amountFromFraction,
  formatWithdrawFractionLabel,
  sanitizeAmountInput,
} from "@/components/withdraw/withdrawUtils";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface WithdrawAmountStepProps {
  amount: string;
  onChangeAmount: (value: string) => void;
  balance?: number;
  balanceLoading?: boolean;
}

export function WithdrawAmountStep({
  amount,
  onChangeAmount,
  balance,
  balanceLoading,
}: WithdrawAmountStepProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
          Available to withdraw
        </Text>
        <Text style={[styles.balanceValue, { color: colors.foreground }]}>
          {balanceLoading ? "—" : formatGhs(balance ?? 0)}
        </Text>
      </View>

      <View
        style={[
          styles.amountCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
          How much would you like to withdraw?
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currency, { color: colors.foreground }]}>₵</Text>
          <TextInput
            accessibilityLabel="Withdrawal amount"
            value={amount}
            onChangeText={(value) => onChangeAmount(sanitizeAmountInput(value))}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.amountInput, { color: colors.foreground }]}
            maxLength={12}
          />
        </View>
      </View>

      <View style={styles.quickSection}>
        <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>
          Quick select
        </Text>
        <View style={styles.quickRow}>
          {QUICK_WITHDRAW_FRACTIONS.map((fraction) => {
            const next = amountFromFraction(balance, fraction);
            const selected = Boolean(next) && amount === next;
            return (
              <Pressable
                key={fraction}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                disabled={!next}
                onPress={() => {
                  if (next) onChangeAmount(next);
                }}
                style={({ pressed }) => [
                  styles.quickChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.muted,
                    borderColor: selected ? colors.primary : colors.border,
                    opacity: next ? 1 : 0.45,
                  },
                  pressed && next ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    {
                      color: selected
                        ? colors.primaryForeground
                        : colors.foreground,
                    },
                  ]}
                >
                  {formatWithdrawFractionLabel(fraction)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  balanceCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 4,
  },
  balanceLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  balanceValue: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.lg,
    letterSpacing: -0.3,
  },
  amountCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: "center",
  },
  prompt: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
  },
  currency: {
    fontFamily: typography.roles.amount,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  amountInput: {
    flex: 1,
    minWidth: 120,
    fontFamily: typography.roles.amount,
    fontSize: 40,
    letterSpacing: -0.8,
    paddingVertical: 4,
    textAlign: "left",
  },
  quickSection: {
    gap: spacing.sm,
  },
  quickLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    marginLeft: 2,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 64,
    alignItems: "center",
  },
  quickChipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
