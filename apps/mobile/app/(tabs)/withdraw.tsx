import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  TabScreenHeader,
  TabScreenLayout,
  TabScreenSection,
} from "@/components/layout/TabScreen";
import {
  MOBILE_MONEY_METHODS,
  MobileMoneyMark,
} from "@/components/payments/MobileMoneyMark";
import { KycActionGate } from "@/components/security/KycActionGate";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { withdrawalApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { formatGhs } from "@/lib/currency";
import { monitoring } from "@/lib/monitoring";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export default function WithdrawScreen() {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const { sessionKey } = useCustomerSession();

  const { data: wallet, isPending: walletPending } = useQuery({
    queryKey: sessionKey
      ? queryKeys.wallet(sessionKey.userId, sessionKey.customerId)
      : ["wallet", "inactive"],
    queryFn: () => fetchCustomerWallet(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = parseFloat(amount);
      if (!parsed || parsed <= 0) throw new Error("Enter a valid amount");
      if (!phone.trim()) throw new Error("Enter your MoMo number");
      if (wallet && parsed > wallet.balance) {
        throw new Error("Amount exceeds your available balance");
      }

      return withdrawalApi.requestWithdrawal({
        amount: parsed,
        disbursementMethod: method,
        disbursementPhone: phone,
      });
    },
    onSuccess: (data) => {
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
      const reference =
        (data as { reference?: string })?.reference || "submitted";
      Alert.alert(
        "Withdrawal requested",
        `Your request is pending staff approval.\n\nReference: ${reference}\n\nYou'll be notified when it's paid out.`,
      );
      setAmount("");
    },
    onError: (err: Error) => {
      monitoring.captureException(err, { scope: "withdrawal.request" });
      Alert.alert("Withdrawal failed", err.message);
    },
  });

  return (
    <TabScreenLayout
      header={<TabScreenHeader title="Withdraw" onGeometry showBack />}
      bankHeader
    >
      <View style={{ gap: 12 }}>
        <OfflineBanner />
        <KycActionGate actionLabel="withdraw">
          <TabScreenSection title="Available balance">
            <View style={styles.balanceWrap}>
              {walletPending && wallet === undefined ? (
                <Text
                  style={[
                    styles.balanceLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Loading balance…
                </Text>
              ) : (
                <Text
                  style={[styles.balanceValue, { color: colors.foreground }]}
                >
                  {formatGhs(wallet?.balance ?? 0)}
                </Text>
              )}
            </View>
          </TabScreenSection>

          <TabScreenSection title="Amount">
            <View style={styles.fieldWrap}>
              <Input
                label="Amount (₵)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
          </TabScreenSection>

          <TabScreenSection title="MoMo number">
            <View style={styles.fieldWrap}>
              <Input
                label="Mobile money number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+233..."
              />
            </View>
          </TabScreenSection>

          <TabScreenSection title="Disbursement method">
            {MOBILE_MONEY_METHODS.map((item, index) => {
              const selected = method === item.id;
              return (
                <View key={item.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMethod(item.id)}
                    style={({ pressed }) => [
                      styles.methodRow,
                      pressed && styles.pressed,
                      selected && {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.03)",
                      },
                    ]}
                  >
                    <MobileMoneyMark
                      methodId={item.id}
                      size={bankChrome.wellSize}
                    />
                    <View style={styles.methodCopy}>
                      <Text
                        style={[
                          styles.methodTitle,
                          { color: colors.foreground },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.methodSubtitle,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {selected ? (
                        <View
                          style={[
                            styles.radioFill,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                  {index < MOBILE_MONEY_METHODS.length - 1 ? (
                    <View
                      style={[
                        styles.methodDivider,
                        { backgroundColor: divider },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </TabScreenSection>

          <View style={styles.ctaWrap}>
            <Button
              title="Request withdrawal"
              loading={mutation.isPending}
              onPress={() => mutation.mutate()}
            />
          </View>
        </KycActionGate>
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  balanceWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
  },
  balanceValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.xl,
  },
  fieldWrap: {
    padding: spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: bankChrome.rowGap,
    paddingVertical: bankChrome.rowPaddingY,
    paddingHorizontal: spacing.xs,
    minHeight: bankChrome.rowMinHeight,
  },
  pressed: {
    opacity: 0.86,
  },
  methodCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  methodTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.2,
  },
  methodSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  methodDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankChrome.wellSize + bankChrome.rowGap + spacing.xs,
  },
  ctaWrap: {
    paddingHorizontal: spacing.xs,
  },
});
