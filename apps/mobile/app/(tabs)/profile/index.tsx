import {
  TabScreenHeader,
  TabScreenLayout,
  TabSectionLabel,
} from "@/components/layout/TabScreen";
import { AppBrandFooter } from "@/components/profile/AppBrandFooter";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { openSupportEmail } from "@/components/profile/ProfileSettingPrimitives";
import { useAuthStore } from "@/stores/auth.store";
import { kycApi } from "@/lib/api";
import { isKycPendingReview, isKycVerified } from "@/lib/kyc";
import { queryKeys } from "@/lib/query-keys";
import { getServiceWellFromLegacy } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import {
  MORE_SERVICE_ITEMS,
  type ServiceMenuItem,
} from "@/types/more-services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";

const MONEY_IDS = new Set([
  "deposit",
  "withdraw",
  "goals",
  "passbook",
  "history",
]);

export default function MoreServicesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);

  const { data: kycStatus } = useQuery({
    queryKey: queryKeys.kycStatus(userId ?? ""),
    queryFn: () => kycApi.getMyStatus(),
    enabled: !!userId,
    staleTime: 60_000,
  });

  const moneyItems = MORE_SERVICE_ITEMS.filter((item) =>
    MONEY_IDS.has(item.id),
  );
  const supportItems = MORE_SERVICE_ITEMS.filter(
    (item) => !MONEY_IDS.has(item.id),
  );

  const showKycPrompt = !!kycStatus && !isKycVerified(kycStatus);
  const kycPending = isKycPendingReview(kycStatus);
  const kycRejected = kycStatus?.kycStatus === "rejected";

  const onItemPress = (item: ServiceMenuItem) => {
    if (item.action === "contact-email") {
      openSupportEmail();
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <TabScreenLayout
      tabRouteName="profile"
      header={<TabScreenHeader title="More" />}
    >
      {showKycPrompt ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/my-profile/kyc")}
          style={({ pressed }) => [
            styles.kycCard,
            {
              backgroundColor: kycRejected
                ? isDark
                  ? "rgba(225,29,72,0.14)"
                  : "#FFF1F2"
                : isDark
                  ? "rgba(245,158,11,0.14)"
                  : "#FFFBEB",
              borderColor: kycRejected
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
              styles.kycIcon,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.7)",
              },
            ]}
          >
            <AppIcon
              name={kycPending ? "clock" : "shield"}
              size={18}
              color={kycRejected ? colors.destructive : "#D97706"}
            />
          </View>
          <View style={styles.kycCopy}>
            <Text style={[styles.kycTitle, { color: colors.foreground }]}>
              {kycRejected
                ? "Verification needs an update"
                : kycPending
                  ? "Verification under review"
                  : "Verify your identity"}
            </Text>
            <Text style={[styles.kycBody, { color: colors.mutedForeground }]}>
              {kycRejected
                ? "Resubmit your ID from My Profile."
                : kycPending
                  ? "Your company admin is reviewing your documents."
                  : "Unlock deposits and withdrawals from My Profile."}
            </Text>
          </View>
          <AppIcon
            name="chevron-right"
            size={16}
            color={colors.mutedForeground}
          />
        </Pressable>
      ) : null}

      <TabSectionLabel>Money</TabSectionLabel>
      <View style={styles.menu}>
        {moneyItems.map((item, index) => {
          const well = getServiceWellFromLegacy(item.tone, isDark);
          return (
            <BankMenuRow
              key={item.id}
              item={{
                id: item.id,
                icon: item.icon,
                label: item.label,
                subtitle: item.subtitle,
                wellBg: well.bg,
                wellFg: well.fg,
                onPress: () => onItemPress(item),
              }}
              showDivider={index < moneyItems.length - 1}
            />
          );
        })}
      </View>

      <TabSectionLabel spaced>Support</TabSectionLabel>
      <View style={styles.menu}>
        {supportItems.map((item, index) => {
          const well = getServiceWellFromLegacy(item.tone, isDark);
          return (
            <BankMenuRow
              key={item.id}
              item={{
                id: item.id,
                icon: item.icon,
                label: item.label,
                subtitle: item.subtitle,
                wellBg: well.bg,
                wellFg: well.fg,
                onPress: () => onItemPress(item),
              }}
              showDivider={index < supportItems.length - 1}
            />
          );
        })}
      </View>

      <View style={styles.brandFooter}>
        <AppBrandFooter />
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  kycCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  kycIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  kycCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  kycTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  kycBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  menu: {
    marginHorizontal: -spacing.lg,
  },
  brandFooter: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
});
