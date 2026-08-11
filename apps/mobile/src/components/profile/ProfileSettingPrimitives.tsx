import * as Linking from "expo-linking";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { bankChrome, getBankWell, type BankWellTone } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";
import { getSupportEmail } from "@/lib/config";

export { appVersion } from "@/lib/app-version";

export function openSupportEmail() {
  Linking.openURL(`mailto:${getSupportEmail()}`);
}

const ICON_TONES: Partial<Record<AppIconName, BankWellTone>> = {
  lock: "olive",
  fingerprint: "mint",
  moon: "amber",
  sun: "amber",
  bell: "blue",
  mail: "sky",
  phone: "mint",
  whatsapp: "mint",
  "file-text": "teal",
  shield: "orange",
  globe: "blue",
  info: "slate",
  key: "orange",
  smartphone: "olive",
  target: "rose",
};

function wellForIcon(icon: AppIconName, isDark: boolean) {
  return getBankWell(ICON_TONES[icon] ?? "slate", isDark);
}

/** On/off must stay obvious in both themes — never white-on-white. */
export function SettingsSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const { isDark } = useTheme();
  const trackOff = isDark ? "#3F3F46" : "#D4D4D8";
  const trackOn = isDark ? "#34D399" : "#059669";
  const thumb = value ? "#FFFFFF" : isDark ? "#A1A1AA" : "#FAFAFA";

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: trackOff, true: trackOn }}
      thumbColor={thumb}
      ios_backgroundColor={trackOff}
    />
  );
}

interface SettingRowProps {
  icon: AppIconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  showDivider?: boolean;
}

export function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  showDivider = true,
}: SettingRowProps) {
  const { colors, isDark } = useTheme();
  const well = wellForIcon(icon, isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const content = (
    <>
      <View style={[styles.well, { backgroundColor: well.bg }]}>
        <AppIcon name={icon} size={18} color={well.fg} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <AppIcon
            name="chevron-right"
            size={18}
            color={isDark ? bankChrome.chevronDark : colors.mutedForeground}
          />
        ) : null)}
    </>
  );

  const row = onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );

  return (
    <View>
      {row}
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: divider }]} />
      ) : null}
    </View>
  );
}

interface SettingToggleProps {
  icon: AppIconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showDivider?: boolean;
  disabled?: boolean;
}

export function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  showDivider = false,
  disabled = false,
}: SettingToggleProps) {
  const { colors, isDark } = useTheme();
  const well = wellForIcon(icon, isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <View>
      <View style={[styles.row, disabled && { opacity: 0.72 }]}>
        <View style={[styles.well, { backgroundColor: well.bg }]}>
          <AppIcon name={icon} size={18} color={well.fg} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.rowTitle, { color: colors.foreground }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.rowSubtitle, { color: colors.mutedForeground }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <SettingsSwitch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      </View>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: divider }]} />
      ) : null}
    </View>
  );
}

interface StatPillProps {
  label: string;
  value: string;
}

export function StatPill({ label, value }: StatPillProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.pillLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.pillValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: bankChrome.rowGap,
    paddingVertical: bankChrome.rowPaddingY,
    paddingHorizontal: bankChrome.rowPaddingX,
    minHeight: bankChrome.rowMinHeight,
  },
  pressed: {
    opacity: 0.7,
  },
  well: {
    width: bankChrome.wellSize,
    height: bankChrome.wellSize,
    borderRadius: bankChrome.wellSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankChrome.rowPaddingX,
    marginRight: bankChrome.rowPaddingX,
  },
  pill: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  pillLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
  },
  pillValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
  },
});
