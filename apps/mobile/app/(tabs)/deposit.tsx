import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { DepositAmountStep } from "@/components/deposit/DepositAmountStep";
import { DepositConfirmStep } from "@/components/deposit/DepositConfirmStep";
import { DepositMethodStep } from "@/components/deposit/DepositMethodStep";
import {
  DepositPendingPanel,
  type PendingDepositSession,
} from "@/components/deposit/DepositPendingPanel";
import { DepositStepIndicator } from "@/components/deposit/DepositStepIndicator";
import {
  getDepositBankLabel,
  getDepositMethodLabel,
  isDepositBankTransfer,
  isDepositMobileMoney,
  parseDepositAmount,
  type DepositStep,
} from "@/components/deposit/depositUtils";
import { HomeKycBanner } from "@/components/home/HomeKycBanner";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import { KycActionGate } from "@/components/security/KycActionGate";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useProfileData } from "@/components/settings/useProfileData";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { depositApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { monitoring } from "@/lib/monitoring";
import { queryKeys } from "@/lib/query-keys";
import { spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

function createIdempotencyKey(): string {
  return `dep_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function DepositScreen() {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [step, setStep] = useState<DepositStep>(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDepositSession | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { phone: profilePhone } = useProfileData();
  const { sessionKey } = useCustomerSession();
  const customerId = sessionKey?.customerId;

  const {
    data: wallet,
    isPending: walletPending,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: sessionKey
      ? queryKeys.wallet(sessionKey.userId, sessionKey.customerId)
      : ["wallet", "inactive"],
    queryFn: () => fetchCustomerWallet(sessionKey!.customerId),
    enabled: !!sessionKey,
    ...financialQueryOptions,
  });

  useEffect(() => {
    if (profilePhone && !phone) {
      setPhone(profilePhone);
    }
  }, [profilePhone, phone]);

  const parsedAmount = useMemo(() => parseDepositAmount(amount), [amount]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchWallet();
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetchWallet, sessionKey]);

  const resetFlow = () => {
    setPending(null);
    setStep(0);
    setAmount("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Customer account not found");
      if (!parsedAmount) throw new Error("Enter a valid amount");
      if (isDepositMobileMoney(method) && !phone.trim()) {
        throw new Error("Enter your mobile money number");
      }
      if (isDepositBankTransfer(method) && !bankCode) {
        throw new Error("Select the bank you will pay from");
      }

      return depositApi.initiate({
        amount: parsedAmount,
        paymentMethod: method,
        customerId,
        payerPhone: phone.trim() || undefined,
        bankCode: isDepositBankTransfer(method)
          ? (bankCode ?? undefined)
          : undefined,
        idempotencyKey: createIdempotencyKey(),
      });
    },
    onSuccess: async (data) => {
      const session: PendingDepositSession = {
        transactionId: data.transactionId,
        reference: data.reference,
        amount: parsedAmount!,
        paymentUrl: data.payment?.paymentUrl,
        bankTransfer: data.payment?.bankTransfer ?? null,
        methodLabel: isDepositBankTransfer(method)
          ? `${getDepositMethodLabel(method)} · ${getDepositBankLabel(bankCode)}`
          : getDepositMethodLabel(method),
      };
      setPending(session);

      if (data.payment?.paymentUrl) {
        await WebBrowser.openBrowserAsync(data.payment.paymentUrl);
      }

      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
    },
    onError: (err: Error) => {
      monitoring.captureException(err, { scope: "deposit.initiate" });
      Alert.alert("Deposit failed", err.message);
    },
  });

  const selectMethod = (next: string) => {
    setMethod(next);
    if (!isDepositBankTransfer(next)) {
      setBankCode(null);
    }
  };

  const goNext = () => {
    if (step === 0) {
      if (!parsedAmount) {
        Alert.alert("Enter an amount", "Choose how much you want to save.");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (isDepositBankTransfer(method) && !bankCode) {
        Alert.alert("Select a bank", "Choose the bank you’ll pay from.");
        return;
      }
      setStep(2);
      return;
    }

    mutation.mutate();
  };

  const goBack = () => {
    if (step === 0) return;
    setStep((current) => (current - 1) as DepositStep);
  };

  const primaryLabel =
    step === 2 ? "Confirm & pay" : step === 1 ? "Continue" : "Continue";

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <TabScreenHeader title="Deposit" />
          {!pending ? <DepositStepIndicator step={step} /> : null}
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.content}>
        <OfflineBanner />
        <KycActionGate actionLabel="deposit">
          {pending ? (
            <DepositPendingPanel
              session={pending}
              onDone={resetFlow}
              onStartNew={resetFlow}
            />
          ) : (
            <>
              {step === 0 ? <HomeKycBanner /> : null}

              {step === 0 ? (
                <DepositAmountStep
                  amount={amount}
                  onChangeAmount={setAmount}
                  balance={wallet?.balance}
                  balanceLoading={walletPending && wallet === undefined}
                />
              ) : null}

              {step === 1 ? (
                <DepositMethodStep
                  method={method}
                  bankCode={bankCode}
                  onSelectMethod={selectMethod}
                  onSelectBank={setBankCode}
                />
              ) : null}

              {step === 2 && parsedAmount ? (
                <DepositConfirmStep
                  amount={parsedAmount}
                  method={method}
                  bankCode={bankCode}
                  phone={phone}
                  onChangePhone={setPhone}
                />
              ) : null}

              <View style={styles.footer}>
                {step > 0 ? (
                  <Button
                    title="Back"
                    variant="secondary"
                    onPress={goBack}
                    style={styles.back}
                  />
                ) : null}
                <Button
                  title={primaryLabel}
                  loading={mutation.isPending}
                  onPress={goNext}
                  style={step > 0 ? styles.primary : styles.full}
                  accessibilityLabel={primaryLabel}
                />
              </View>
            </>
          )}
        </KycActionGate>
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  back: {
    flex: 1,
  },
  primary: {
    flex: 2,
  },
  full: {
    flex: 1,
  },
});
