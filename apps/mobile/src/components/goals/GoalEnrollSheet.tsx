import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Input } from "@/components/Input";
import {
  formatPlanAmountRange,
  formatPlanFrequency,
  parseTargetAmount,
  sanitizeTargetAmount,
} from "@/components/goals/goalUtils";
import { formatGhs } from "@/lib/currency";
import type { SavingsPlan } from "@/lib/api";
import { planApi } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface GoalEnrollSheetProps {
  plan: SavingsPlan | null;
  visible: boolean;
  onClose: () => void;
  onEnrolled: () => void;
}

export function GoalEnrollSheet({
  plan,
  visible,
  onClose,
  onEnrolled,
}: GoalEnrollSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [targetAmount, setTargetAmount] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error("No plan selected");
      const parsed = parseTargetAmount(targetAmount);
      if (parsed && parsed < Number(plan.minAmount)) {
        throw new Error(
          `Minimum target is ${formatGhs(Number(plan.minAmount))}`,
        );
      }
      return planApi.enroll({
        planId: plan.id,
        targetAmount: parsed ?? undefined,
      });
    },
    onSuccess: () => {
      setTargetAmount("");
      onEnrolled();
      onClose();
      Alert.alert(
        "Goal started",
        "You're enrolled. Keep saving to hit your target.",
      );
    },
    onError: (err: Error) => {
      Alert.alert("Could not join", err.message);
    },
  });

  const handleClose = () => {
    if (mutation.isPending) return;
    setTargetAmount("");
    onClose();
  };

  if (!plan) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title="Join savings goal"
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={handleClose}
              hitSlop={12}
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
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.planCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {plan.name}
            </Text>
            {plan.description ? (
              <Text
                style={[styles.planBody, { color: colors.mutedForeground }]}
              >
                {plan.description}
              </Text>
            ) : null}
            <View style={styles.planMeta}>
              <Text
                style={[
                  styles.planMetaLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                Frequency
              </Text>
              <Text
                style={[styles.planMetaValue, { color: colors.foreground }]}
              >
                {formatPlanFrequency(plan.frequency)}
              </Text>
            </View>
            <View style={styles.planMeta}>
              <Text
                style={[
                  styles.planMetaLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                Contribution range
              </Text>
              <Text
                style={[styles.planMetaValue, { color: colors.foreground }]}
              >
                {formatPlanAmountRange(plan)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Input
              label="Target amount (optional)"
              value={targetAmount}
              onChangeText={(value) =>
                setTargetAmount(sanitizeTargetAmount(value))
              }
              keyboardType="decimal-pad"
              placeholder={formatGhs(Number(plan.minAmount))}
            />
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Set a personal target to track progress. Minimum contribution is{" "}
              {formatGhs(Number(plan.minAmount))}.
            </Text>
          </View>

          <Button
            title="Start this goal"
            loading={mutation.isPending}
            onPress={() => mutation.mutate()}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  planCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  planName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.2,
  },
  planBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  planMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  planMetaLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
  },
  planMetaValue: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    textAlign: "right",
    flexShrink: 1,
  },
  formCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
});
