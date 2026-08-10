import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  TabScreenDivider,
  TabScreenHeader,
  TabScreenLayout,
  TabScreenSection,
} from "@/components/layout/TabScreen";
import { ProfileRow } from "@/components/profile/ProfileSections";
import type { AppIconName } from "@/components/icons/AppIcon";
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
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

const METHODS: { id: string; label: string; icon: AppIconName }[] = [
  { id: "mtn_momo", label: "MTN MoMo", icon: "smartphone" },
  { id: "telecel_cash", label: "Telecel Cash", icon: "smartphone" },
  { id: "airteltigo", label: "AirtelTigo Money", icon: "smartphone" },
];

export default function WithdrawScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");

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
    <TabScreenLayout header={<TabScreenHeader title="Withdraw" />}>
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
            {METHODS.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <TabScreenDivider /> : null}
                <ProfileRow
                  icon={item.icon}
                  label={item.label}
                  onPress={() => setMethod(item.id)}
                  right={
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor:
                            method === item.id ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {method === item.id ? (
                        <View
                          style={[
                            styles.radioFill,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      ) : null}
                    </View>
                  }
                />
              </View>
            ))}
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
  ctaWrap: {
    paddingHorizontal: spacing.xs,
  },
});
