import { AppIcon } from "@/components/icons/AppIcon";
import { TransactionReceiptDocument } from "@/components/activity/TransactionReceiptDocument";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buildReceiptDocument,
  formatReceiptDate,
} from "@susuflow/shared/client";
import { formatGhs } from "@/lib/currency";
import { downloadReceiptFile, shareReceiptFile } from "@/lib/receipt-export";
import { StatusBadge } from "@/components/activity/StatusBadge";
import {
  getPaymentMethodLabel,
  getPhoneLabel,
} from "@/components/activity/transactionUtils";
import { Button } from "@/components/Button";
import type { Transaction } from "@/lib/api";
import { tenantApi } from "@/lib/api";
import { getWebBaseUrl } from "@/lib/config";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface TransactionReceiptSheetProps {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
}

type ReceiptView = "summary" | "document";

function SummaryRow({
  label,
  value,
  mono,
  uppercase,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  uppercase?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.summaryRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          {
            color: colors.foreground,
            fontFamily: mono
              ? typography.fontFamily.medium
              : typography.fontFamily.semibold,
            textTransform: uppercase ? "uppercase" : "capitalize",
          },
        ]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionReceiptSheet({
  transaction,
  visible,
  onClose,
}: TransactionReceiptSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const tenantSlug = useAuthStore((s) => s.tenantSlug);
  const [view, setView] = useState<ReceiptView>("summary");
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  useEffect(() => {
    if (!visible) {
      setView("summary");
      setBusy(null);
    }
  }, [visible]);

  const { data: tenantInfo } = useQuery({
    queryKey: ["tenant-branding", transaction?.tenant?.slug || tenantSlug],
    queryFn: () =>
      tenantApi.getBySlug(transaction?.tenant?.slug || tenantSlug || ""),
    enabled: visible && !!(transaction?.tenant?.slug || tenantSlug),
  });

  const companyName = useMemo(() => {
    if (!transaction) return "SusuFlow Platform";
    return transaction.tenant?.name || tenantInfo?.name || "SusuFlow Platform";
  }, [transaction, tenantInfo]);

  const receiptDocument = useMemo(() => {
    if (!transaction) return null;
    return buildReceiptDocument(transaction, {
      companyName,
      webOrigin: getWebBaseUrl(),
    });
  }, [transaction, companyName]);

  if (!transaction || !receiptDocument) return null;

  const isDeposit = transaction.type === "deposit";
  const amount = Number(transaction.amount);
  const methodLabel = getPaymentMethodLabel(transaction);
  const phoneLabel = getPhoneLabel(transaction);
  const customerName = transaction.customer?.user
    ? `${transaction.customer.user.firstName} ${transaction.customer.user.lastName}`.trim()
    : null;

  const receiptOptions = {
    companyName,
    webOrigin: getWebBaseUrl(),
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      await shareReceiptFile(transaction, receiptOptions);
    } catch {
      // cancelled
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      await downloadReceiptFile(transaction, receiptOptions);
    } catch {
      Alert.alert(
        "Could not save receipt",
        "Try sharing the receipt instead, or check app permissions.",
      );
    } finally {
      setBusy(null);
    }
  };

  const headerTitle =
    view === "summary" ? "Transaction details" : "Official receipt";

  const detailRows = [
    {
      label: "Reference",
      value: transaction.reference,
      mono: true,
      uppercase: true,
    },
    { label: "Transaction type", value: transaction.type },
    ...(customerName ? [{ label: "Customer", value: customerName }] : []),
    { label: "Payment method", value: methodLabel },
    ...(phoneLabel
      ? [{ label: "Account / phone", value: phoneLabel, mono: true }]
      : []),
    { label: "Currency", value: "₵" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title={headerTitle}
          leading={
            view === "document" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to transaction details"
                onPress={() => setView("summary")}
                hitSlop={12}
                style={({ pressed }) => pressed && styles.headerPressed}
              >
                <AppIcon
                  name="chevron-left"
                  size={22}
                  color={colors.mutedForeground}
                />
              </Pressable>
            ) : undefined
          }
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.headerPressed}
            >
              <AppIcon name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          }
        />

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {view === "summary" ? (
            <>
              <View style={styles.companyBlock}>
                <Text style={[styles.companyName, { color: colors.heading }]}>
                  {companyName}
                </Text>
                <Text
                  style={[
                    styles.companyDate,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {formatReceiptDate(transaction.createdAt)}
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
                <View style={styles.amountCardHeader}>
                  <Text
                    style={[
                      styles.amountLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {isDeposit ? "Amount saved" : "Amount withdrawn"}
                  </Text>
                  <StatusBadge status={transaction.status} />
                </View>
                <Text style={[styles.amountValue, { color: colors.heading }]}>
                  {formatGhs(amount)}
                </Text>
              </View>

              <View
                style={[
                  styles.detailsCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {detailRows.map((row, index) => (
                  <SummaryRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    mono={"mono" in row ? row.mono : undefined}
                    uppercase={"uppercase" in row ? row.uppercase : undefined}
                    last={index === detailRows.length - 1}
                  />
                ))}
              </View>

              <View style={styles.actions}>
                <Button
                  title="View receipt"
                  onPress={() => setView("document")}
                />
                <Button title="Done" variant="secondary" onPress={onClose} />
              </View>
            </>
          ) : (
            <>
              <TransactionReceiptDocument document={receiptDocument} />
              <View style={styles.actions}>
                <Button
                  title="Download receipt"
                  onPress={handleDownload}
                  loading={busy === "download"}
                />
                <Button
                  title="Share receipt"
                  variant="secondary"
                  onPress={handleShare}
                  loading={busy === "share"}
                />
                <Button
                  title="Back to details"
                  variant="secondary"
                  onPress={() => setView("summary")}
                />
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerPressed: {
    opacity: 0.7,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  companyBlock: {
    alignItems: "center",
    gap: 4,
    paddingBottom: spacing.sm,
  },
  companyName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.lg,
    textAlign: "center",
  },
  companyDate: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
  },
  amountCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  amountCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
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
  detailsCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  summaryLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.size.sm,
    textAlign: "right",
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
