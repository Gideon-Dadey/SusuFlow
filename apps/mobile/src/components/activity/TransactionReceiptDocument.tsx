import { AppIcon } from "@/components/icons/AppIcon";
import { TenantBrandMark } from "@/components/branding/TenantBrandMark";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  type ReceiptDocumentData,
  type ReceiptSettlementTone,
} from "@susuflow/shared/client";
import { bankChrome, getBankWell, type BankWellTone } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface TransactionReceiptDocumentProps {
  document: ReceiptDocumentData;
  logoUrl?: string | null;
}

const TONE_KEY: Record<ReceiptSettlementTone, BankWellTone> = {
  settled: "mint",
  pending: "amber",
  failed: "rose",
};

const TONE_LABEL: Record<ReceiptSettlementTone, string> = {
  settled: "Settled",
  pending: "Pending",
  failed: "Failed",
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
  const { colors, isDark } = useTheme();
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  return (
    <View
      style={[
        styles.detailRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: divider,
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

/**
 * Official receipt — same open surface as Transaction details.
 * Credentials sit on the page, not inside nested cards.
 */
export function TransactionReceiptDocument({
  document: doc,
  logoUrl,
}: TransactionReceiptDocumentProps) {
  const { colors, isDark } = useTheme();
  const well = getBankWell(TONE_KEY[doc.settlementTone], isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  const amountCardBg = isDark ? "#121212" : colors.card;

  const openVerifyUrl = async () => {
    await WebBrowser.openBrowserAsync(doc.verifyUrl);
  };

  const detailRows = [
    { label: "Receipt No.", value: doc.receiptCode, mono: true },
    { label: "Customer", value: doc.customerName },
    { label: "Reference", value: doc.reference, mono: true },
    { label: "Payment method", value: doc.paymentMethodDisplay },
    { label: "Paid at", value: doc.paymentTime },
    { label: "Member ID", value: doc.customerId, mono: true },
    { label: "Type", value: doc.transactionType },
    ...(doc.phoneLabel
      ? [{ label: "Account / phone", value: doc.phoneLabel, mono: true }]
      : [{ label: "Currency", value: "GHS (₵)" }]),
  ];

  const settleRows = [
    { label: "Total bill", value: doc.amountFormatted, strong: false },
    {
      label: doc.settlementLabel,
      value: doc.amountFormatted,
      strong: true,
      accent: true,
    },
    { label: "Balance due", value: doc.balanceFormatted, strong: true },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.companyBlock}>
        <TenantBrandMark logoUrl={logoUrl} size={52} />
        <Text style={[styles.companyName, { color: colors.heading }]}>
          {doc.companyName}
        </Text>
        <Text style={[styles.companyDate, { color: colors.mutedForeground }]}>
          Official electronic receipt · {doc.issuedAt}
        </Text>
      </View>

      <View
        style={[
          styles.amountCard,
          {
            backgroundColor: amountCardBg,
            borderColor: divider,
          },
        ]}
      >
        <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>
          {doc.isDeposit ? "Amount received" : "Amount paid out"}
        </Text>
        <Text style={[styles.amountValue, { color: colors.heading }]}>
          {doc.amountFormatted}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: well.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: well.fg }]} />
          <Text style={[styles.statusText, { color: well.fg }]}>
            {TONE_LABEL[doc.settlementTone]} · {doc.statusLabel}
          </Text>
        </View>
        {doc.serviceLine ? (
          <Text style={[styles.serviceLine, { color: colors.mutedForeground }]}>
            {doc.serviceLine}
          </Text>
        ) : null}
      </View>

      <View style={styles.bleed}>
        {detailRows.map((row, index) => (
          <DetailRow
            key={row.label}
            label={row.label}
            value={row.value}
            mono={row.mono}
            last={index === detailRows.length - 1}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        Settlement
      </Text>
      <View style={styles.bleed}>
        {settleRows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.detailRow,
              index < settleRows.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: divider,
              },
            ]}
          >
            <Text
              style={[
                styles.detailLabel,
                { color: row.accent ? well.fg : colors.mutedForeground },
              ]}
            >
              {row.label}
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: row.accent ? well.fg : colors.foreground,
                  fontFamily: row.strong
                    ? typography.fontFamily.bold
                    : typography.fontFamily.semibold,
                },
              ]}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        Verification
      </Text>
      <View style={styles.verifyBlock}>
        <Text style={[styles.verifyHint, { color: colors.mutedForeground }]}>
          Confirm this receipt on SusuFlow with the reference above.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Verify receipt online"
          onPress={openVerifyUrl}
          style={({ pressed }) => [
            styles.verifyButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.verifyButtonText,
              { color: colors.primaryForeground },
            ]}
          >
            Verify online
          </Text>
          <AppIcon
            name="chevron-right"
            size={16}
            color={colors.primaryForeground}
          />
        </Pressable>
        <Text
          style={[styles.hash, { color: colors.mutedForeground }]}
          selectable
          numberOfLines={2}
        >
          Artifact · SHA-256 {doc.artifactHash.slice(0, 24)}…
        </Text>
        <Text style={[styles.finePrint, { color: colors.mutedForeground }]}>
          Issued by {doc.companyName}. System-generated electronic receipt. Not
          a bank statement.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  companyBlock: {
    alignItems: "center",
    gap: 10,
    paddingBottom: spacing.sm,
  },
  companyName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  companyDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    textAlign: "center",
  },
  amountCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: 8,
  },
  amountLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  amountValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
  },
  serviceLine: {
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 2,
  },
  bleed: {
    marginHorizontal: -spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  detailLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize + 1,
    flex: 1,
  },
  detailValue: {
    fontSize: bankChrome.subtitleSize + 1,
    textAlign: "right",
    flex: 1,
    lineHeight: 20,
  },
  verifyBlock: {
    gap: 12,
  },
  verifyHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  verifyButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  hash: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  finePrint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
});
