import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { DepositAmountStep } from "@/components/deposit/DepositAmountStep";
import { DepositConfirmStep } from "@/components/deposit/DepositConfirmStep";
import { DepositMethodStep } from "@/components/deposit/DepositMethodStep";
import { DepositStepIndicator } from "@/components/deposit/DepositStepIndicator";
import {
  parseDepositAmount,
  type DepositStep,
} from "@/components/deposit/depositUtils";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import { useProfileData } from "@/components/settings/useProfileData";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { depositApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { spacing } from "@/theme/tokens";

export default function DepositScreen() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DepositStep>(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");

  const { phone: profilePhone } = useProfileData();

  const { sessionKey } = useCustomerSession();
  const customerId = sessionKey?.customerId;

  const { data: wallet, isPending: walletPending } = useQuery({
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("Customer account not found");
      if (!parsedAmount) throw new Error("Enter a valid amount");
      if (!phone.trim()) throw new Error("Enter your mobile money number");

      return depositApi.initiate({
        amount: parsedAmount,
        paymentMethod: method,
        customerId,
        payerPhone: phone.trim(),
      });
    },
    onSuccess: async (data) => {
      if (data.payment?.paymentUrl) {
        await WebBrowser.openBrowserAsync(data.payment.paymentUrl);
      }
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
      Alert.alert(
        "Deposit started",
        `We sent a payment request to your phone.\n\nReference: ${data.reference}`,
      );
      setStep(0);
      setAmount("");
    },
    onError: (err: Error) => {
      Alert.alert("Deposit failed", err.message);
    },
  });

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
          <DepositStepIndicator step={step} />
        </View>
      }
    >
      <View style={styles.content}>
        {step === 0 ? (
          <DepositAmountStep
            amount={amount}
            onChangeAmount={setAmount}
            balance={wallet?.balance}
            balanceLoading={walletPending && wallet === undefined}
          />
        ) : null}

        {step === 1 ? (
          <DepositMethodStep method={method} onSelectMethod={setMethod} />
        ) : null}

        {step === 2 && parsedAmount ? (
          <DepositConfirmStep
            amount={parsedAmount}
            method={method}
            phone={phone}
            onChangePhone={setPhone}
          />
        ) : null}
      </View>

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
        />
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
