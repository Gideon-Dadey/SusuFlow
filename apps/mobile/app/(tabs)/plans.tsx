import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { GoalEnrollSheet } from "@/components/goals/GoalEnrollSheet";
import { GoalPlanCard } from "@/components/goals/GoalPlanCard";
import { GoalProgressCard } from "@/components/goals/GoalProgressCard";
import { GoalsEmptyState } from "@/components/goals/GoalsEmptyState";
import { SusuMembershipCard } from "@/components/goals/SusuMembershipCard";
import {
  TabScreenHeader,
  TabScreenLayout,
  TabSectionLabel,
} from "@/components/layout/TabScreen";
import { AppBrandFooter } from "@/components/profile/AppBrandFooter";
import { useProfileData } from "@/components/settings/useProfileData";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { QueryErrorState } from "@/components/ui/QueryErrorState";
import { PlanEnrollmentSkeleton } from "@/components/ui/Skeleton";
import type { SavingsPlan } from "@/lib/api";
import { planApi } from "@/lib/api";
import { plansQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function GoalsScreen() {
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const {
    groupName,
    logoUrl,
    profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfileData();
  const authUserId = useAuthStore((s) => s.user?.id);
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const plansQuery = useQuery({
    queryKey: queryKeys.plans,
    queryFn: () => planApi.listPlans(),
    ...plansQueryOptions,
  });

  const enrollmentsQuery = useQuery({
    queryKey: queryKeys.enrollments(authUserId ?? ""),
    queryFn: () => planApi.listEnrollments(),
    enabled: !!authUserId,
    ...plansQueryOptions,
  });

  const plans = plansQuery.data;
  const enrollments = enrollmentsQuery.data;
  const plansPending = plansQuery.isPending;
  const enrollPending = enrollmentsQuery.isPending;

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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        plansQuery.refetch(),
        enrollmentsQuery.refetch(),
        refetchProfile(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [enrollmentsQuery, plansQuery, refetchProfile]);

  const showActiveSkeleton = enrollPending && enrollments === undefined;
  const showCatalogSkeleton = plansPending && plans === undefined;

  const showError =
    (plansQuery.isError && plans === undefined && !enrollments) ||
    (enrollmentsQuery.isError && enrollments === undefined && !plans);

  return (
    <>
      <TabScreenLayout
        tabRouteName="plans"
        header={<TabScreenHeader title="Goals" />}
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
          <SusuMembershipCard
            groupName={groupName}
            logoUrl={logoUrl}
            memberId={memberId}
            isLoading={profileLoading}
          />

          {showError ? (
            <QueryErrorState
              title="Couldn’t load goals"
              message="Check your connection and try again."
              onRetry={() => void onRefresh()}
            />
          ) : null}

          <TabSectionLabel spaced>Active goals</TabSectionLabel>
          <View style={styles.menu}>
            {showActiveSkeleton ? (
              <PlanEnrollmentSkeleton rows={2} />
            ) : !enrollments?.length ? (
              <GoalsEmptyState variant="active" />
            ) : (
              enrollments.map((enrollment, index) => (
                <GoalProgressCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  showDivider={index < enrollments.length - 1}
                />
              ))
            )}
          </View>

          <TabSectionLabel spaced>Available plans</TabSectionLabel>
          <View style={styles.menu}>
            {showCatalogSkeleton ? (
              <PlanEnrollmentSkeleton rows={2} />
            ) : !plans?.length ? (
              <GoalsEmptyState variant="catalog" />
            ) : (
              plans.map((plan, index) => (
                <GoalPlanCard
                  key={plan.id}
                  plan={plan}
                  enrolled={enrolledPlanIds.has(plan.id)}
                  onPress={() => openEnroll(plan)}
                  showDivider={index < plans.length - 1}
                />
              ))
            )}
          </View>

          <View style={styles.brandFooter}>
            <AppBrandFooter />
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
    gap: 0,
  },
  menu: {
    marginHorizontal: -spacing.lg,
  },
  brandFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
});
