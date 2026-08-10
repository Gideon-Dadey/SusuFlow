import { useRouter, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { AvatarEditor } from "@/components/profile/AvatarEditor";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { ProfileGeometricBackdrop } from "@/components/profile/ProfileGeometricBackdrop";
import { useProfileData } from "@/components/settings/useProfileData";
import { formatLastLoginLabel } from "@/lib/last-login";
import { useAuthStore } from "@/stores/auth.store";
import { bankChrome, getWellForIcon } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import type { AppIconName } from "@/components/icons/AppIcon";

type MenuDef = {
  id: string;
  label: string;
  subtitle?: string;
  icon: AppIconName;
  href?: string;
  logout?: boolean;
};

const MENU: MenuDef[] = [
  {
    id: "settings",
    label: "Settings",
    subtitle: "Appearance, alerts, and account preferences",
    icon: "settings",
    href: "/my-profile/settings",
  },
  {
    id: "personal",
    label: "Personal details",
    subtitle: "Name, phone, and contact info",
    icon: "user",
    href: "/my-profile/personal",
  },
  {
    id: "account",
    label: "Account overview",
    subtitle: "Membership, email, and group details",
    icon: "wallet",
    href: "/my-profile/account",
  },
  {
    id: "kyc",
    label: "Identity verification",
    subtitle: "Verify your ID to unlock deposits and withdrawals",
    icon: "shield",
    href: "/my-profile/kyc",
  },
  {
    id: "security",
    label: "Security",
    subtitle: "Password, biometrics, and app lock",
    icon: "smartphone",
    href: "/my-profile/security",
  },
  {
    id: "notifications",
    label: "Notifications",
    subtitle: "Choose how SusuFlow reaches you",
    icon: "bell",
    href: "/my-profile/notifications",
  },
  {
    id: "logout",
    label: "Sign out",
    icon: "power",
    logout: true,
  },
];

export default function MyProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const lastLoginAt = useAuthStore((s) => s.lastLoginAt);
  const { displayName, initials, avatarUrl, isLoading } = useProfileData();
  const lastLoginLabel = formatLastLoginLabel(lastLoginAt);

  const pageBg = isDark ? bankChrome.pageDark : bankChrome.pageLight;
  /** Sticky nav band only — avatar overlaps into the scroll body. */
  const stickyHeight = insets.top + 56;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {/* Sticky geometric header + back — native pin, does not scroll */}
      <View style={[styles.stickyHeader, { height: stickyHeight }]}>
        <ProfileGeometricBackdrop height={stickyHeight} isDark={isDark} />
        <View style={[styles.navRow, { paddingTop: insets.top + 4 }]}>
          <BackArrowButton onPress={() => router.back()} color="#FFFFFF" />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.identity}>
          <AvatarEditor
            initials={initials}
            displayName={displayName}
            imageUrl={avatarUrl}
            size="xxl"
            showActionLabel={false}
            badgeVariant="plus"
          />
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {isLoading ? "…" : displayName}
          </Text>
          {lastLoginLabel ? (
            <Text
              style={[styles.lastLogin, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {lastLoginLabel}
            </Text>
          ) : null}
        </View>

        <View style={styles.menu}>
          {MENU.map((item, index) => {
            const well = getWellForIcon(item.icon, isDark);
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
                  onPress: item.logout
                    ? () => void logout()
                    : () => router.push(item.href as Href),
                }}
                showDivider={index < MENU.length - 1}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyHeader: {
    zIndex: 4,
    overflow: "hidden",
  },
  navRow: {
    paddingHorizontal: spacing.lg,
    zIndex: 2,
    minHeight: 44,
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  identity: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: 6,
  },
  name: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.35,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  lastLogin: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  menu: {
    marginTop: spacing.xl,
  },
});
