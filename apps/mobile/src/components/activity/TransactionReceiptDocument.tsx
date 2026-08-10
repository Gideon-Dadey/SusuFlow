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
import { radius, spacing, typography } from "@/theme/tokens";

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

function MetaRow({
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
        styles.metaRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: divider,
        },
      ]}
    >
      <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
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

function DashedRule() {
  const { isDark } = useTheme();
  const bit = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  return (
    <View style={styles.dashTrack} accessibilityElementsHidden>
      {Array.from({ length: 28 }, (_, i) => (
        <View key={i} style={[styles.dashBit, { backgroundColor: bit }]} />
      ))}
    </View>
  );
}

/**
 * Official electronic receipt — bank-slip hierarchy with bankChrome tokens.
 */
export function TransactionReceiptDocument({
  document: doc,
  logoUrl,
}: TransactionReceiptDocumentProps) {
  const { colors, isDark } = useTheme();
  const well = getBankWell(TONE_KEY[doc.settlementTone], isDark);
  const shieldWell = getBankWell("olive", isDark);
  const paper = isDark ? "#121212" : "#FFFEFB";
  const paperBorder = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  const inkSoft = colors.mutedForeground;

  const openVerifyUrl = async () => {
    await WebBrowser.openBrowserAsync(doc.verifyUrl);
  };

  const meta = [
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

  return (
    <View
      style={[
        styles.paper,
        {
          backgroundColor: paper,
          borderColor: paperBorder,
          shadowColor: isDark ? "#000" : "#0F172A",
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <TenantBrandMark logoUrl={logoUrl} size={40} />
          <View style={styles.brandCopy}>
            <Text
              style={[styles.companyName, { color: colors.heading }]}
              numberOfLines={2}
            >
              {doc.companyName}
            </Text>
            <Text style={[styles.eyebrow, { color: inkSoft }]}>
              Official electronic receipt
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.codePill,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(15,23,42,0.04)",
              borderColor: paperBorder,
            },
          ]}
        >
          <Text style={[styles.codeLabel, { color: inkSoft }]}>
            Receipt No.
          </Text>
          <Text style={[styles.codeValue, { color: colors.foreground }]}>
            {doc.receiptCode}
          </Text>
        </View>
      </View>

      <DashedRule />

      <View style={styles.hero}>
        <Text style={[styles.heroLabel, { color: inkSoft }]}>
          {doc.isDeposit ? "Amount received" : "Amount paid out"}
        </Text>
        <Text style={[styles.heroAmount, { color: colors.heading }]}>
          {doc.amountFormatted}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: well.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: well.fg }]} />
          <Text style={[styles.statusText, { color: well.fg }]}>
            {TONE_LABEL[doc.settlementTone]} · {doc.statusLabel}
          </Text>
        </View>
        <Text style={[styles.serviceLine, { color: colors.mutedForeground }]}>
          {doc.serviceLine}
        </Text>
      </View>

      <DashedRule />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: inkSoft }]}>Details</Text>
        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(15,23,42,0.025)",
              borderColor: paperBorder,
            },
          ]}
        >
          {meta.map((row, index) => (
            <MetaRow
              key={row.label}
              label={row.label}
              value={row.value}
              mono={"mono" in row ? row.mono : undefined}
              last={index === meta.length - 1}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: inkSoft }]}>
          Settlement
        </Text>
        <View
          style={[
            styles.settleCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(15,23,42,0.025)",
              borderColor: paperBorder,
            },
          ]}
        >
          <View style={styles.settleRow}>
            <Text style={[styles.settleLabel, { color: inkSoft }]}>
              Total bill
            </Text>
            <Text style={[styles.settleValue, { color: colors.foreground }]}>
              {doc.amountFormatted}
            </Text>
          </View>
          <View style={styles.settleRow}>
            <Text style={[styles.settleLabel, { color: well.fg }]}>
              {doc.settlementLabel}
            </Text>
            <Text style={[styles.settleValueStrong, { color: well.fg }]}>
              {doc.amountFormatted}
            </Text>
          </View>
          <View
            style={[styles.settleDivider, { backgroundColor: paperBorder }]}
          />
          <View style={styles.settleRow}>
            <Text style={[styles.settleLabel, { color: inkSoft }]}>
              Balance due
            </Text>
            <Text style={[styles.settleValueStrong, { color: colors.heading }]}>
              {doc.balanceFormatted}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: inkSoft }]}>
          Verification
        </Text>
        <View
          style={[
            styles.verifyCard,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.03)"
                : "rgba(15,23,42,0.025)",
              borderColor: paperBorder,
            },
          ]}
        >
          <View style={styles.verifyTop}>
            <View
              style={[styles.verifyIcon, { backgroundColor: shieldWell.bg }]}
            >
              <AppIcon
                name="shield"
                size={16}
                color={shieldWell.fg}
                strokeWidth={2}
              />
            </View>
            <View style={styles.verifyCopy}>
              <Text style={[styles.verifyTitle, { color: colors.foreground }]}>
                Authenticity check
              </Text>
              <Text style={[styles.verifyHint, { color: inkSoft }]}>
                Confirm this receipt on SusuFlow with the reference above.
              </Text>
            </View>
          </View>

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
            style={[styles.hash, { color: inkSoft }]}
            selectable
            numberOfLines={2}
          >
            Artifact · SHA-256 {doc.artifactHash.slice(0, 24)}…
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.finePrint, { color: inkSoft }]}>
          Issued by {doc.companyName} · {doc.issuedAt}
        </Text>
        <Text style={[styles.finePrint, { color: inkSoft }]}>
          System-generated electronic receipt. Not a bank statement.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  companyName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  codePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  codeValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  dashTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginVertical: 2,
  },
  dashBit: {
    width: 6,
    height: 1.5,
    borderRadius: 1,
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: 8,
  },
  heroLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heroAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 46,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: radius.full,
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
    marginTop: 4,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 280,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  metaCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  metaLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    flex: 1,
  },
  metaValue: {
    fontSize: 13,
    textAlign: "right",
    flex: 1.15,
    lineHeight: 18,
  },
  settleCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  settleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  settleLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  settleValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
  },
  settleValueStrong: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  settleDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  verifyCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  verifyTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  verifyIcon: {
    width: bankChrome.wellSize,
    height: bankChrome.wellSize,
    borderRadius: bankChrome.wellSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  verifyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    letterSpacing: -0.15,
  },
  verifyHint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  verifyButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    letterSpacing: -0.15,
  },
  hash: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: 4,
  },
  finePrint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
});
