import { useQuery } from "@tanstack/react-query";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import {
  TabScreenHeader,
  TabScreenLayout,
  TabSectionLabel,
} from "@/components/layout/TabScreen";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { PlanEnrollmentSkeleton } from "@/components/ui/Skeleton";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { customerApi } from "@/lib/api";
import { financialQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { formatGhs } from "@/lib/currency";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export default function PassbookScreen() {
  const { colors, isDark } = useTheme();
  const { sessionKey } = useCustomerSession();
  const [refreshing, setRefreshing] = useState(false);

  const passbookQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.passbook(sessionKey.userId, sessionKey.customerId)
      : ["passbook", "inactive"],
    queryFn: () => customerApi.getPassbook(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const passbook = passbookQuery.data;
  const showSkeleton =
    passbookQuery.isPending && passbook === undefined && !!sessionKey;
  const showError = passbookQuery.isError && passbook === undefined;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await passbookQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [passbookQuery]);

  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <TabScreenLayout
      header={<TabScreenHeader title="Passbook" showBack />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.primary}
        />
      }
    >
      <OfflineBanner />

      {showError ? (
        <QueryErrorState
          title="Couldn’t load passbook"
          message="Check your connection and try again."
          onRetry={() => void onRefresh()}
        />
      ) : null}

      {showSkeleton ? <PlanEnrollmentSkeleton rows={4} /> : null}

      {passbook ? (
        <View style={styles.content}>
          <View
            style={[
              styles.summary,
              {
                borderColor: divider,
                backgroundColor: isDark ? "#111111" : colors.card,
              },
            ]}
          >
            <SummaryRow
              label="Balance"
              value={formatGhs(passbook.balance)}
              color={colors.foreground}
            />
            <SummaryRow
              label="Available"
              value={formatGhs(passbook.availableBalance)}
              color={colors.foreground}
            />
            <SummaryRow
              label="Total paid in"
              value={formatGhs(passbook.totalDeposited)}
              color={colors.foreground}
            />
            <SummaryRow
              label="Total withdrawn"
              value={formatGhs(passbook.totalWithdrawn)}
              color={colors.mutedForeground}
            />
            <SummaryRow
              label="Payments recorded"
              value={String(passbook.depositCount)}
              color={colors.mutedForeground}
            />
          </View>

          <TabSectionLabel spaced>Payment history</TabSectionLabel>
          <View style={styles.menu}>
            {!passbook.entries.length ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                No confirmed payments yet. When you deposit, each payment is
                marked here — your digital passbook.
              </Text>
            ) : (
              passbook.entries.map((entry, index) => (
                <View
                  key={entry.id}
                  style={[
                    styles.row,
                    index < passbook.entries.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: divider,
                    },
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text
                      style={[styles.rowTitle, { color: colors.foreground }]}
                    >
                      {formatGhs(entry.amount)}
                    </Text>
                    <Text
                      style={[
                        styles.rowMeta,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {new Date(entry.paidAt).toLocaleString()} ·{" "}
                      {entry.reference}
                    </Text>
                  </View>
                  <Text style={[styles.paidMark, { color: colors.primary }]}>
                    Paid
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      ) : null}
    </TabScreenLayout>
  );
}

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 0,
  },
  summary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  summaryLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
  },
  summaryValue: {
    fontFamily: typography.roles.headline,
    fontSize: 15,
  },
  menu: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
  },
  rowMeta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
  },
  paidMark: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
