import { AppIcon } from "@/components/icons/AppIcon";
import { StyleSheet, Text, View } from "react-native";
import { Input } from "@/components/Input";
import { getDepositMethodLabel } from "@/components/deposit/depositUtils";
import { formatGhs } from "@/lib/currency";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface DepositConfirmStepProps {
  amount: number;
  method: string;
  phone: string;
  onChangePhone: (value: string) => void;
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

export function DepositConfirmStep({
  amount,
  method,
  phone,
  onChangePhone,
}: DepositConfirmStepProps) {
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
          Review deposit
        </Text>
        <Text style={[styles.reviewAmount, { color: colors.foreground }]}>
          {formatGhs(amount)}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SummaryRow
          label="Payment method"
          value={getDepositMethodLabel(method)}
        />
        <SummaryRow label="Destination" value="Your Susu wallet" />
      </View>

      <View
        style={[
          styles.phoneCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Input
          label="Mobile money number"
          value={phone}
          onChangeText={onChangePhone}
          keyboardType="phone-pad"
          placeholder="055 123 4567"
          autoComplete="tel"
        />
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
          After you confirm, you&apos;ll get a prompt on your phone to approve
          the payment. Funds appear once your provider confirms.
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
  phoneCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
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
