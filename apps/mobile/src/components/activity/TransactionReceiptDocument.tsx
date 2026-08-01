import { AppIcon } from "@/components/icons/AppIcon";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  type ReceiptDocumentData,
  type ReceiptSettlementTone,
} from "@susuflow/shared/client";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, surfaceRadius, typography } from "@/theme/tokens";

interface TransactionReceiptDocumentProps {
  document: ReceiptDocumentData;
}

const SETTLEMENT_BAR: Record<
  ReceiptSettlementTone,
  { light: string; dark: string }
> = {
  settled: { light: "#16a34a", dark: "#22c55e" },
  pending: { light: "#d97706", dark: "#f59e0b" },
  failed: { light: "#dc2626", dark: "#ef4444" },
};

function DetailRow({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.detailRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          {
            color: colors.foreground,
            fontFamily: mono
              ? typography.fontFamily.medium
              : typography.fontFamily.semibold,
          },
        ]}
        selectable
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionReceiptDocument({
  document: doc,
}: TransactionReceiptDocumentProps) {
  const { colors, isDark } = useTheme();
  const barColor =
    SETTLEMENT_BAR[doc.settlementTone][isDark ? "dark" : "light"];

  const openVerifyUrl = async () => {
    await WebBrowser.openBrowserAsync(doc.verifyUrl);
  };

  return (
    <View
      style={[
        styles.paper,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.brandBlock}>
        <Text style={[styles.companyName, { color: colors.primary }]}>
          {doc.companyName.toUpperCase()}
        </Text>
        <Text style={[styles.docTitle, { color: colors.foreground }]}>
          {doc.title}
        </Text>
        <View
          style={[
            styles.receiptCodeBadge,
            {
              backgroundColor: colors.muted,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[styles.receiptCodeLabel, { color: colors.mutedForeground }]}
          >
            Receipt
          </Text>
          <Text style={[styles.receiptCodeValue, { color: colors.foreground }]}>
            {doc.receiptCode}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.detailsCard,
          {
            backgroundColor: colors.muted,
            borderColor: colors.border,
          },
        ]}
      >
        <DetailRow label="Customer name" value={doc.customerName} />
        <DetailRow label="Invoice / ref #" value={doc.reference} mono />
        <DetailRow label="Payment method" value={doc.paymentMethodDisplay} />
        <DetailRow label="Payment time" value={doc.paymentTime} />
        <DetailRow label="Customer ID" value={doc.customerId} mono />
        <DetailRow label="Transaction type" value={doc.transactionType} />
        <DetailRow label="Payment status" value={doc.statusLabel} />
        <DetailRow label="Payment ref" value={doc.paymentRef} mono />
        {doc.phoneLabel ? (
          <DetailRow label="Account / phone" value={doc.phoneLabel} mono last />
        ) : (
          <DetailRow label="Currency" value={doc.currency} last />
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Line items
        </Text>
        <View
          style={[
            styles.lineItemCard,
            {
              backgroundColor: colors.muted,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.lineItemService, { color: colors.foreground }]}>
            {doc.serviceLine}
          </Text>
          <View style={styles.lineItemMeta}>
            <Text
              style={[styles.lineItemQty, { color: colors.mutedForeground }]}
            >
              Qty 1 · Unit {doc.amountFormatted}
            </Text>
            <Text style={[styles.lineItemTotal, { color: colors.foreground }]}>
              {doc.amountFormatted}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            Total bill
          </Text>
          <Text style={[styles.totalValue, { color: colors.foreground }]}>
            {doc.amountFormatted}
          </Text>
        </View>
        <View style={[styles.settlementRow, { backgroundColor: barColor }]}>
          <Text style={styles.settlementLabel}>{doc.settlementLabel}</Text>
          <Text style={styles.settlementValue}>{doc.amountFormatted}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            Balance
          </Text>
          <Text style={[styles.totalValue, { color: colors.foreground }]}>
            {doc.balanceFormatted}
          </Text>
        </View>
      </View>

      <View style={[styles.verifyBlock, { borderTopColor: colors.border }]}>
        <Text style={[styles.verifyHeading, { color: colors.foreground }]}>
          Verification
        </Text>
        <Text style={[styles.verifyHint, { color: colors.mutedForeground }]}>
          Confirm this receipt on SusuFlow using the reference below.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Verify receipt online"
          onPress={openVerifyUrl}
          style={({ pressed }) => [
            styles.verifyButton,
            {
              borderColor: colors.primary,
              backgroundColor: pressed ? colors.muted : "transparent",
            },
          ]}
        >
          <AppIcon name="shield" size={16} color={colors.primary} />
          <Text style={[styles.verifyButtonText, { color: colors.primary }]}>
            Verify receipt online
          </Text>
          <AppIcon name="chevron-right" size={14} color={colors.primary} />
        </Pressable>
        <Text
          style={[styles.verifyUrl, { color: colors.mutedForeground }]}
          selectable
          numberOfLines={2}
        >
          {doc.verifyUrl}
        </Text>
        <Text
          style={[styles.hash, { color: colors.mutedForeground }]}
          selectable
        >
          Artifact SHA-256: {doc.artifactHash}
        </Text>
      </View>

      <Text style={[styles.finePrint, { color: colors.mutedForeground }]}>
        Issued by {doc.companyName} · {doc.issuedAt}
      </Text>
      <Text style={[styles.finePrint, { color: colors.mutedForeground }]}>
        System-generated electronic receipt. Timestamp {doc.paymentTime}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    borderRadius: surfaceRadius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingBottom: spacing.lg,
  },
  brandBlock: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: 6,
  },
  companyName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  docTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  receiptCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  receiptCodeLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  receiptCodeValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.8,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  detailLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.size.xs,
    textAlign: "right",
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  lineItemCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  lineItemService: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  lineItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  lineItemQty: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    flex: 1,
  },
  lineItemTotal: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  totals: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.md,
  },
  totalLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  totalValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
  },
  settlementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  settlementLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: "#ffffff",
  },
  settlementValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: "#ffffff",
  },
  verifyBlock: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  verifyHeading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  verifyHint: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 17,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  verifyButtonText: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  verifyUrl: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  hash: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
  },
  finePrint: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    fontFamily: typography.roles.caption,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
});
