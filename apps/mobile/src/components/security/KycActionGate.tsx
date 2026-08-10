import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/stores/auth.store";
import { kycApi } from "@/lib/api";
import { isKycVerified } from "@/lib/kyc";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

/**
 * Soft-blocks money movement until identity is verified.
 * Pending review still blocks deposits/withdrawals for safety.
 */
export function KycActionGate({
  actionLabel,
  children,
}: {
  actionLabel: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);

  const statusQuery = useQuery({
    queryKey: queryKeys.kycStatus(userId ?? ""),
    queryFn: () => kycApi.getMyStatus(),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const verified = isKycVerified(statusQuery.data);
  if (verified || statusQuery.isPending) {
    return <>{children}</>;
  }

  const pending = statusQuery.data?.documents?.some(
    (d) => d.status === "pending",
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isDark ? "rgba(245,158,11,0.16)" : "#FFFBEB",
          },
        ]}
      >
        <AppIcon name="shield" size={24} color="#D97706" />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {pending ? "Identity under review" : "Verify your identity"}
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {pending
          ? `You can ${actionLabel.toLowerCase()} once your company approves your documents.`
          : `Complete identity verification before you ${actionLabel.toLowerCase()}. This protects your savings.`}
      </Text>
      <Button
        title={pending ? "View status" : "Verify identity"}
        onPress={() => router.push("/(tabs)/profile/kyc")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.base,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
