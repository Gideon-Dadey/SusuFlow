import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
import { useMoneyStepUp } from "@/hooks/useMoneyStepUp";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { AnalyticsEvents, analytics } from "@/lib/analytics";
import { withdrawalApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import {
  financialQueryOptions,
  invalidateCustomerFinancials,
} from "@/lib/financial-queries";
import { createIdempotencyKey } from "@/lib/idempotency";
import { monitoring } from "@/lib/monitoring";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "@/stores/toast.store";
import { spacing } from "@/theme/tokens";

export default function WithdrawScreen() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const { requestStepUp, StepUpModal, appLockEnabled } = useMoneyStepUp();
  const [step, setStep] = useState<WithdrawStep>(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("mtn_momo");
  const [submitted, setSubmitted] = useState<SubmittedWithdrawal | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

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
    idempotencyKeyRef.current = null;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!parsedAmount) throw new Error("Enter a valid amount");
      if (!phone.trim()) throw new Error("Enter your MoMo number");
      if (wallet && parsedAmount > wallet.balance) {
        throw new Error("Amount exceeds your available balance");
      }
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = createIdempotencyKey("wd");
      }

      return withdrawalApi.requestWithdrawal({
        amount: parsedAmount,
        disbursementMethod: method,
        disbursementPhone: phone.trim(),
        idempotencyKey: idempotencyKeyRef.current,
      });
    },
    onSuccess: (data) => {
      analytics.track(AnalyticsEvents.withdrawConfirmed, {
        amount: parsedAmount ?? 0,
        method,
      });
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
      idempotencyKeyRef.current = null;
      if (!appLockEnabled) {
        toast.info("Tip: turn on App lock in Security for safer payouts.");
      }
    },
    onError: (err: Error) => {
      analytics.track(AnalyticsEvents.withdrawFailed, {
        message: err.message,
      });
      monitoring.captureException(err, { scope: "withdrawal.request" });
      toast.error(err.message || "Withdrawal failed");
    },
  });

  const goNext = async () => {
    if (!isOnline) {
      toast.error("You’re offline. Connect to request a withdrawal.");
      return;
    }

    if (step === 0) {
      if (!parsedAmount) {
        toast.error("Choose how much you want to withdraw.");
        return;
      }
      if (wallet && parsedAmount > wallet.balance) {
        toast.error("You can’t withdraw more than your available balance.");
        return;
      }
      analytics.track(AnalyticsEvents.withdrawStarted, {
        amount: parsedAmount,
      });
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!phone.trim()) {
        toast.error("Enter the MoMo number for your payout.");
        return;
      }
      setStep(2);
      return;
    }

    const ok = await requestStepUp("Confirm withdrawal");
    if (!ok) {
      toast.info("Withdrawal cancelled.");
      return;
    }
    mutation.mutate();
  };

  const goBack = () => {
    if (step === 0) return;
    if (step === 2) {
      idempotencyKeyRef.current = null;
    }
    setStep((current) => (current - 1) as WithdrawStep);
  };

  const primaryLabel = step === 2 ? "Confirm & request" : "Continue";
  const primaryDisabled = !isOnline || mutation.isPending;

  return (
    <TabScreenLayout
      header={
        <View style={styles.header}>
          <TabScreenHeader title="Withdraw" showBack />
          {!submitted ? <WithdrawStepIndicator step={step} /> : null}
        </View>
      }
    >
      {StepUpModal}
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
                  title={!isOnline ? "Offline" : primaryLabel}
                  loading={mutation.isPending}
                  disabled={primaryDisabled}
                  onPress={() => void goNext()}
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
