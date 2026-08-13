import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { AvatarEditor } from "@/components/profile/AvatarEditor";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { useProfileData } from "@/components/settings/useProfileData";
import { formatLastLoginLabel } from "@/lib/last-login";
import { useAuthStore } from "@/stores/auth.store";
import { bankChrome, getServiceWellFromLegacy } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import { MY_PROFILE_ITEMS } from "@/types/more-services";
import type { AppIconName } from "@/components/icons/AppIcon";

export default function MyProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const lastLoginAt = useAuthStore((s) => s.lastLoginAt);
  const { displayName, initials, avatarUrl, isLoading } = useProfileData();
  const lastLoginLabel = formatLastLoginLabel(lastLoginAt);

  const pageBg = isDark ? bankChrome.pageDark : bankChrome.pageLight;
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const signOutWell = getServiceWellFromLegacy("rose", isDark);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + 4,
            backgroundColor: pageBg,
          },
        ]}
      >
        <View style={styles.navRow}>
          <BackArrowButton
            onPress={() => router.back()}
            color={colors.foreground}
          />
          <Text style={[styles.navTitle, { color: colors.foreground }]}>
            My Profile
          </Text>
          <View style={styles.navSide} />
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

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Account
        </Text>
        <View style={styles.menu}>
          {MY_PROFILE_ITEMS.slice(0, 2).map((item, index) => {
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
                  onPress: () => {
                    if (item.href) router.push(item.href);
                  },
                }}
                showDivider={index < 1}
              />
            );
          })}
        </View>

        <Text
          style={[
            styles.sectionLabel,
            styles.sectionLabelSpaced,
            { color: colors.mutedForeground },
          ]}
        >
          Preferences
        </Text>
        <View style={styles.menu}>
          {MY_PROFILE_ITEMS.slice(2).map((item, index, arr) => {
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
                  onPress: () => {
                    if (item.href) router.push(item.href);
                  },
                }}
                showDivider={index < arr.length - 1}
              />
            );
          })}
        </View>

        <View style={[styles.signOutRule, { backgroundColor: divider }]} />

        <View style={styles.menu}>
          <BankMenuRow
            item={{
              id: "logout",
              icon: "power" as AppIconName,
              label: "Sign out",
              wellBg: signOutWell.bg,
              wellFg: signOutWell.fg,
              onPress: () => void logout(),
            }}
            showDivider={false}
          />
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
    paddingBottom: spacing.sm,
  },
  navRow: {
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.2,
  },
  navSide: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  identity: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
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
  sectionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: 4,
  },
  sectionLabelSpaced: {
    marginTop: spacing.lg,
  },
  menu: {
    marginTop: 0,
  },
  signOutRule: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
});
