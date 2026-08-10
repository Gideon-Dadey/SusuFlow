import { AppIcon } from "@/components/icons/AppIcon";
import { TenantBrandMark } from "@/components/branding/TenantBrandMark";
import { TransactionReceiptDocument } from "@/components/activity/TransactionReceiptDocument";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { getWebBaseUrl } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchTenantBranding,
  tenantBrandingQueryOptions,
} from "@/lib/tenant-branding";
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
  const { colors, isDark } = useTheme();
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
    queryKey: queryKeys.tenantBranding(
      transaction?.tenant?.slug || tenantSlug || "",
    ),
    queryFn: () =>
      fetchTenantBranding(transaction?.tenant?.slug || tenantSlug || ""),
    enabled: visible && !!(transaction?.tenant?.slug || tenantSlug),
    ...tenantBrandingQueryOptions,
  });

  const companyName = useMemo(() => {
    if (!transaction) return "SusuFlow Platform";
    return tenantInfo?.name || transaction.tenant?.name || "SusuFlow Platform";
  }, [transaction, tenantInfo]);

  const logoUrl = tenantInfo?.logoUrl ?? null;

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
    { label: "Currency", value: "GHS" },
  ];

  const stageBg = isDark ? "#0A0A0A" : "#F3F4F6";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.root,
          {
            backgroundColor: view === "document" ? stageBg : colors.background,
          },
        ]}
      >
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
            view === "document" && styles.scrollDocument,
            {
              paddingBottom:
                view === "document"
                  ? insets.bottom + 108
                  : insets.bottom + spacing.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {view === "summary" ? (
            <>
              <View style={styles.companyBlock}>
                <TenantBrandMark logoUrl={logoUrl} size={48} />
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
                  title="View official receipt"
                  onPress={() => setView("document")}
                />
                <Button title="Done" variant="secondary" onPress={onClose} />
              </View>
            </>
          ) : (
            <TransactionReceiptDocument
              document={receiptDocument}
              logoUrl={logoUrl}
            />
          )}
        </ScrollView>

        {view === "document" ? (
          <View
            style={[
              styles.dock,
              {
                paddingBottom: Math.max(insets.bottom, 14),
                backgroundColor: isDark
                  ? "rgba(10,10,10,0.94)"
                  : "rgba(255,255,255,0.96)",
                borderTopColor: colors.border,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share receipt"
              disabled={busy !== null}
              onPress={() => void handleShare()}
              style={({ pressed }) => [
                styles.dockBtn,
                styles.dockBtnSecondary,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "#F1F5F9",
                  borderColor: colors.border,
                  opacity: pressed || busy ? 0.72 : 1,
                },
              ]}
            >
              {busy === "share" ? (
                <ActivityIndicator color={colors.foreground} size="small" />
              ) : (
                <>
                  <AppIcon name="share" size={17} color={colors.foreground} />
                  <Text
                    style={[styles.dockBtnLabel, { color: colors.foreground }]}
                  >
                    Share
                  </Text>
                </>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Download receipt"
              disabled={busy !== null}
              onPress={() => void handleDownload()}
              style={({ pressed }) => [
                styles.dockBtn,
                styles.dockBtnPrimary,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed || busy ? 0.82 : 1,
                },
              ]}
            >
              {busy === "download" ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <>
                  <AppIcon
                    name="download"
                    size={17}
                    color={colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.dockBtnLabel,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Download PDF
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}
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
  scrollDocument: {
    paddingTop: spacing.md,
  },
  companyBlock: {
    alignItems: "center",
    gap: 8,
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
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dockBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dockBtnSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  dockBtnPrimary: {},
  dockBtnLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
