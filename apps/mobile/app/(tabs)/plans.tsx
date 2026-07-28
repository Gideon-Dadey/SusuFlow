import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GoalEnrollSheet } from "@/components/goals/GoalEnrollSheet";
import { GoalPlanCard } from "@/components/goals/GoalPlanCard";
import { GoalProgressCard } from "@/components/goals/GoalProgressCard";
import { GoalsEmptyState } from "@/components/goals/GoalsEmptyState";
import { SusuMembershipCard } from "@/components/goals/SusuMembershipCard";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import { useProfileData } from "@/components/settings/useProfileData";
import { PlanEnrollmentSkeleton } from "@/components/ui/Skeleton";
import type { SavingsPlan } from "@/lib/api";
import { planApi } from "@/lib/api";
import { plansQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export default function GoalsScreen() {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { groupName, profile, isLoading: profileLoading } = useProfileData();
  const authUserId = useAuthStore((s) => s.user?.id);
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);

  const { data: plans, isPending: plansPending } = useQuery({
    queryKey: queryKeys.plans,
    queryFn: () => planApi.listPlans(),
    ...plansQueryOptions,
  });

  const { data: enrollments, isPending: enrollPending } = useQuery({
    queryKey: queryKeys.enrollments(authUserId ?? ""),
    queryFn: () => planApi.listEnrollments(),
    enabled: !!authUserId,
    ...plansQueryOptions,
  });

  const enrolledPlanIds = useMemo(
    () => new Set((enrollments ?? []).map((item) => item.plan.id)),
    [enrollments],
  );

  const memberId = profile?.customer?.customerNumber;

  const openEnroll = (plan: SavingsPlan) => {
    setSelectedPlan(plan);
    setEnrollOpen(true);
  };

  const handleEnrolled = () => {
    if (authUserId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments(authUserId),
      });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.plans });
  };

  const showGoalsSkeleton =
    (plansPending && plans === undefined) ||
    (enrollPending && enrollments === undefined);

  return (
    <>
      <TabScreenLayout header={<TabScreenHeader title="Goals" />}>
        <View style={styles.content}>
          <SusuMembershipCard
            groupName={groupName}
            memberId={memberId}
            isLoading={profileLoading}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Your active goals
            </Text>
            {showGoalsSkeleton ? (
              <PlanEnrollmentSkeleton rows={2} />
            ) : !enrollments?.length ? (
              <GoalsEmptyState variant="active" />
            ) : (
              <View style={styles.list}>
                {enrollments.map((enrollment) => (
                  <GoalProgressCard
                    key={enrollment.id}
                    enrollment={enrollment}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Available plans
            </Text>
            <Text
              style={[styles.sectionHint, { color: colors.mutedForeground }]}
            >
              Savings programs offered by your susu
            </Text>
            {showGoalsSkeleton ? (
              <PlanEnrollmentSkeleton rows={2} />
            ) : !plans?.length ? (
              <GoalsEmptyState variant="catalog" />
            ) : (
              <View style={styles.list}>
                {plans.map((plan) => (
                  <GoalPlanCard
                    key={plan.id}
                    plan={plan}
                    enrolled={enrolledPlanIds.has(plan.id)}
                    onPress={() => openEnroll(plan)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </TabScreenLayout>

      <GoalEnrollSheet
        plan={selectedPlan}
        visible={enrollOpen}
        onClose={() => {
          setEnrollOpen(false);
          setSelectedPlan(null);
        }}
        onEnrolled={handleEnrolled}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
    marginLeft: 2,
  },
  sectionHint: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    marginLeft: 2,
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
});
