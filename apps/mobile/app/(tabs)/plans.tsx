import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Screen } from "@/components/Screen";
import { planApi } from "@/lib/api";
import { colors, typography } from "@/theme/tokens";

export default function PlansScreen() {
  const queryClient = useQueryClient();
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => planApi.listPlans(),
  });

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => planApi.listEnrollments(),
  });

  const enrollMutation = useMutation({
    mutationFn: () => {
      if (!selectedPlanId) throw new Error("Select a savings goal");
      const parsed = targetAmount ? parseFloat(targetAmount) : undefined;
      return planApi.enroll({ planId: selectedPlanId, targetAmount: parsed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      Alert.alert("Enrolled", "You joined the savings goal.");
      setTargetAmount("");
      setSelectedPlanId(null);
    },
    onError: (err: Error) => Alert.alert("Enrollment failed", err.message),
  });

  return (
    <Screen title="Savings Goals" subtitle="Plan and track your targets">
      <Card title="Your enrollments">
        {enrollLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : !enrollments?.length ? (
          <Text style={styles.muted}>No active goals yet</Text>
        ) : (
          enrollments.map((e) => (
            <View key={e.id} style={styles.enrollment}>
              <Text style={styles.planName}>{e.plan.name}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, e.progressPercent)}%` },
                  ]}
                />
              </View>
              <Text style={styles.muted}>
                {e.progressPercent}% · {e.status}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card title="Available goals">
        {plansLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.planList}>
            {(plans || []).map((plan) => (
              <Button
                key={plan.id}
                title={plan.name}
                variant={selectedPlanId === plan.id ? "primary" : "outline"}
                onPress={() => setSelectedPlanId(plan.id)}
              />
            ))}
          </View>
        )}

        <Input
          label="Target amount (optional)"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        <Button
          title="Join goal"
          loading={enrollMutation.isPending}
          onPress={() => enrollMutation.mutate()}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    color: colors.mutedForeground,
  },
  enrollment: {
    gap: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  planName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    color: colors.foreground,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  planList: {
    gap: 8,
  },
});
