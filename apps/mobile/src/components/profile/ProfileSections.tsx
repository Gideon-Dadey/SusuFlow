import { OptionsMenuButton } from "@/components/navigation/OptionsMenuButton";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  TabScreenDivider,
  TabScreenSection,
} from "@/components/layout/TabScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export {
  appVersion,
  openSupportEmail,
  SettingRow,
  SettingToggle,
  StatPill,
} from "./ProfileSettingPrimitives";

export function ProfileSection(props: { title: string; children: ReactNode }) {
  return <TabScreenSection {...props} />;
}

export function ProfileDivider() {
  return <TabScreenDivider />;
}

interface ProfileRowProps {
  icon: AppIconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
}

export function ProfileRow({
  icon,
  label,
  subtitle,
  onPress,
  right,
  destructive = false,
  showChevron = true,
}: ProfileRowProps) {
  const { colors } = useTheme();
  const labelColor = destructive ? colors.destructive : colors.foreground;
  const iconColor = destructive ? colors.destructive : colors.primary;

  const content = (
    <>
      <View style={styles.iconSlot}>
        <AppIcon name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right !== undefined ? (
        right
      ) : showChevron && onPress ? (
        <AppIcon
          name="chevron-right"
          size={18}
          color={colors.mutedForeground}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

interface ProfileAccountRowProps {
  initials: string;
  name: string;
  email?: string;
  clientId: string;
  seed?: string;
  onPress?: () => void;
}

export function ProfileAccountRow({
  initials,
  name,
  email,
  clientId,
  seed,
  onPress,
}: ProfileAccountRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]}
    >
      <UserAvatar
        initials={initials}
        seed={seed ?? name}
        size="md"
        showVerified
      />
      <View style={styles.accountCopy}>
        <Text
          style={[styles.accountName, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {email ? (
          <Text
            style={[styles.accountSubtitle, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {email}
          </Text>
        ) : null}
        <Text
          style={[styles.accountMeta, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          Client ID · {clientId}
        </Text>
      </View>
      <AppIcon name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function ProfileMenuButton(props: { onPress: () => void }) {
  return <OptionsMenuButton {...props} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,
    minHeight: 92,
  },
  pressed: {
    opacity: 0.82,
  },
  iconSlot: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  accountCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  accountName: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.base,
    letterSpacing: -0.2,
  },
  accountSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
  },
  accountMeta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    letterSpacing: 0.15,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  subtitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
});
