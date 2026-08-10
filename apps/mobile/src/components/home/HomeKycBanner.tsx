import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { homeChrome } from "@/components/home/homeChrome";
import { useAuthStore } from "@/stores/auth.store";
import { kycApi } from "@/lib/api";
import { isKycPendingReview, isKycVerified } from "@/lib/kyc";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

/** Soft home prompt when identity is not yet verified. */
export function HomeKycBanner() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: status } = useQuery({
    queryKey: queryKeys.kycStatus(userId ?? ""),
    queryFn: () => kycApi.getMyStatus(),
    enabled: !!userId,
    staleTime: 60_000,
  });

  if (!status || isKycVerified(status)) return null;

  const pending = isKycPendingReview(status);
  const rejected = status.kycStatus === "rejected";

  const title = rejected
    ? "Verification needs an update"
    : pending
      ? "Verification under review"
      : "Verify your identity";
  const body = rejected
    ? "Resubmit your ID and selfie to continue saving."
    : pending
      ? "Your company admin is reviewing your documents."
      : "Complete Ghana Card or passport verification before you start saving.";
  const cta = rejected ? "Resubmit" : pending ? "View status" : "Get verified";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/(tabs)/profile/kyc")}
      style={({ pressed }) => [
        styles.banner,
        {
          backgroundColor: rejected
            ? isDark
              ? "rgba(225,29,72,0.14)"
              : "#FFF1F2"
            : isDark
              ? "rgba(245,158,11,0.14)"
              : "#FFFBEB",
          borderColor: rejected
            ? isDark
              ? "rgba(225,29,72,0.35)"
              : "#FECDD3"
            : isDark
              ? "rgba(245,158,11,0.35)"
              : "#FDE68A",
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.7)",
          },
        ]}
      >
        <AppIcon
          name={pending ? "clock" : "shield"}
          size={18}
          color={rejected ? colors.destructive : "#D97706"}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          {body}
        </Text>
        <Text
          style={[
            styles.cta,
            { color: isDark ? homeChrome.linkDark : homeChrome.link },
          ]}
        >
          {cta}
        </Text>
      </View>
      <AppIcon name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  body: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  cta: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.9,
  },
});
