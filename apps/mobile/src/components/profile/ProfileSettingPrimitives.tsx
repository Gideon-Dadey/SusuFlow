import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { bankChrome, getBankWell, type BankWellTone } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";
import { getSupportEmail } from "@/lib/config";

export { appVersion } from "@/lib/app-version";

type IoniconName = keyof typeof Ionicons.glyphMap;

export function openSupportEmail() {
  Linking.openURL(`mailto:${getSupportEmail()}`);
}

const ION_TONES: Partial<Record<string, BankWellTone>> = {
  "lock-closed-outline": "olive",
  "finger-print-outline": "mint",
  "moon-outline": "amber",
  "sunny-outline": "amber",
  "notifications-outline": "blue",
  "mail-outline": "sky",
  "call-outline": "mint",
  "logo-whatsapp": "mint",
  "document-text-outline": "teal",
  "shield-checkmark-outline": "orange",
  "shield-outline": "orange",
  "globe-outline": "blue",
  "information-circle-outline": "slate",
  "key-outline": "orange",
  "phone-portrait-outline": "olive",
  "flag-outline": "rose",
};

function wellForIon(icon: string, isDark: boolean) {
  return getBankWell(ION_TONES[icon] ?? "slate", isDark);
}

interface SettingRowProps {
  icon: IoniconName;
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
  const well = wellForIon(icon, isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const content = (
    <>
      <View style={[styles.well, { backgroundColor: well.bg }]}>
        <Ionicons name={icon} size={18} color={well.fg} />
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
          <Ionicons
            name="chevron-forward"
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
  icon: IoniconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  showDivider?: boolean;
}

export function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  showDivider = false,
}: SettingToggleProps) {
  const { colors, isDark } = useTheme();
  const well = wellForIon(icon, isDark);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <View>
      <View style={styles.row}>
        <View style={[styles.well, { backgroundColor: well.bg }]}>
          <Ionicons name={icon} size={18} color={well.fg} />
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
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
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
