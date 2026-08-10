import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { HomeKycBanner } from "@/components/home/HomeKycBanner";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import { KycActionGate } from "@/components/security/KycActionGate";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useProfileData } from "@/components/settings/useProfileData";
import { WithdrawAmountStep } from "@/components/withdraw/WithdrawAmountStep";
import { WithdrawConfirmStep } from "@/components/withdraw/WithdrawConfirmStep";
import { WithdrawMethodStep } from "@/components/withdraw/WithdrawMethodStep";
import {
  WithdrawSubmittedPanel,
  type SubmittedWithdrawal,
} from "@/components/withdraw/WithdrawSubmittedPanel";
import { WithdrawStepIndicator } from "@/components/withdraw/WithdrawStepIndicator";
import {
  getWithdrawMethodLabel,
  parseWithdrawAmount,
  type WithdrawStep,
} from "@/components/withdraw/withdrawUtils";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { withdrawalApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { monitoring } from "@/lib/monitoring";
import { queryKeys } from "@/lib/query-keys";
import { spacing } from "@/theme/tokens";

export default function WithdrawScreen() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WithdrawStep>(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [submitted, setSubmitted] = useState<SubmittedWithdrawal | null>(null);

  const { phone: profilePhone } = useProfileData();
  const { sessionKey } = useCustomerSession();

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

  const parsedAmount = useMemo(() => parseWithdrawAmount(amount), [amount]);

  const resetFlow = () => {
    setSubmitted(null);
    setStep(0);
    setAmount("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!parsedAmount) throw new Error("Enter a valid amount");
      if (!phone.trim()) throw new Error("Enter your MoMo number");
      if (wallet && parsedAmount > wallet.balance) {
        throw new Error("Amount exceeds your available balance");
      }

      return withdrawalApi.requestWithdrawal({
        amount: parsedAmount,
        disbursementMethod: method,
        disbursementPhone: phone.trim(),
      });
    },
    onSuccess: (data) => {
      if (sessionKey) {
        invalidateCustomerFinancials(queryClient, sessionKey);
      }
      const reference =
        (data as { reference?: string })?.reference || "submitted";
      setSubmitted({
        reference,
        amount: parsedAmount!,
        methodLabel: getWithdrawMethodLabel(method),
        phone: phone.trim(),
      });
    },
    onError: (err: Error) => {
      monitoring.captureException(err, { scope: "withdrawal.request" });
      Alert.alert("Withdrawal failed", err.message);
    },
  });

  const goNext = () => {
    if (step === 0) {
      if (!parsedAmount) {
        Alert.alert("Enter an amount", "Choose how much you want to withdraw.");
        return;
      }
      if (wallet && parsedAmount > wallet.balance) {
        Alert.alert(
          "Amount too high",
          "You can’t withdraw more than your available balance.",
        );
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!phone.trim()) {
        Alert.alert(
          "Enter a MoMo number",
          "We need the wallet number for your payout.",
        );
        return;
      }
      setStep(2);
      return;
    }

    mutation.mutate();
  };

  const goBack = () => {
    if (step === 0) return;
    setStep((current) => (current - 1) as WithdrawStep);
  };

  const primaryLabel = step === 2 ? "Confirm & request" : "Continue";

  return (
    <TabScreenLayout
      bankHeader
      header={
        <View style={styles.header}>
          <TabScreenHeader title="Withdraw" onGeometry showBack />
          {!submitted ? <WithdrawStepIndicator step={step} onGeometry /> : null}
        </View>
      }
    >
      <View style={styles.content}>
        <OfflineBanner />
        <KycActionGate actionLabel="withdraw">
          {submitted ? (
            <WithdrawSubmittedPanel
              submission={submitted}
              onDone={resetFlow}
              onStartNew={resetFlow}
            />
          ) : (
            <>
              {step === 0 ? <HomeKycBanner /> : null}

              {step === 0 ? (
                <WithdrawAmountStep
                  amount={amount}
                  onChangeAmount={setAmount}
                  balance={wallet?.balance}
                  balanceLoading={walletPending && wallet === undefined}
                />
              ) : null}

              {step === 1 ? (
                <WithdrawMethodStep
                  method={method}
                  phone={phone}
                  onSelectMethod={setMethod}
                  onChangePhone={setPhone}
                />
              ) : null}

              {step === 2 && parsedAmount ? (
                <WithdrawConfirmStep
                  amount={parsedAmount}
                  method={method}
                  phone={phone}
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
                  style={styles.primary}
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
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  back: {
    flex: 0.4,
  },
  primary: {
    flex: 1,
  },
});
