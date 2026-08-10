import {
  PaymentMethodMark,
  hasPaymentMethodMark,
} from "@/components/payments/MobileMoneyMark";
import { StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { getWithdrawMethodLabel } from "@/components/withdraw/withdrawUtils";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface WithdrawConfirmStepProps {
  amount: number;
  method: string;
  phone: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

export function WithdrawConfirmStep({
  amount,
  method,
  phone,
}: WithdrawConfirmStepProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.reviewCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.reviewTitle, { color: colors.mutedForeground }]}>
          Review withdrawal
        </Text>
        <Text style={[styles.reviewAmount, { color: colors.foreground }]}>
          {formatGhs(amount)}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.methodSummary}>
          {hasPaymentMethodMark(method) ? (
            <PaymentMethodMark methodId={method} size={28} />
          ) : null}
          <View style={styles.methodSummaryCopy}>
            <Text
              style={[styles.summaryLabel, { color: colors.mutedForeground }]}
            >
              Destination
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {getWithdrawMethodLabel(method)}
            </Text>
          </View>
        </View>
        <SummaryRow label="MoMo number" value={phone.trim() || "—"} />
        <SummaryRow label="Source" value="Your Susu wallet" />
      </View>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: isDark ? colors.muted : colors.primary50,
            borderColor: colors.border,
          },
        ]}
      >
        <AppIcon name="shield" size={16} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Withdrawals require staff approval before funds leave your wallet.
          You’ll get a notification when the payout is completed. Never share
          your MoMo PIN with anyone.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  reviewCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewTitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  reviewAmount: {
    fontFamily: typography.roles.amount,
    fontSize: typography.size.xxl,
    letterSpacing: -0.6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
  },
  summaryValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    textAlign: "right",
    flexShrink: 1,
  },
  methodSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 4,
  },
  methodSummaryCopy: {
    flex: 1,
    gap: 2,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
});
