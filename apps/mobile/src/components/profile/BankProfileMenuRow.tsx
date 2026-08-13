import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { bankChrome, getWellForIcon } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

export interface BankMenuItem {
  id?: string;
  label: string;
  subtitle?: string;
  icon: AppIconName;
  wellBg?: string;
  wellFg?: string;
  onPress?: () => void;
  destructive?: boolean;
  right?: ReactNode;
  showChevron?: boolean;
}

interface BankMenuRowProps {
  item: BankMenuItem;
  showDivider?: boolean;
}

/** Canonical bank list row — colored well · title/subtitle · chevron. */
export function BankMenuRow({ item, showDivider = true }: BankMenuRowProps) {
  const { colors, isDark } = useTheme();
  const autoWell = getWellForIcon(item.icon, isDark);
  const wellBg = item.wellBg ?? autoWell.bg;
  const wellFg = item.destructive
    ? colors.destructive
    : (item.wellFg ?? autoWell.fg);
  const labelColor = item.destructive ? colors.destructive : colors.foreground;
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;
  const showChevron =
    item.showChevron !== false && !!item.onPress && item.right === undefined;

  const content = (
    <>
      <View style={[styles.well, { backgroundColor: wellBg }]}>
        <AppIcon name={item.icon} size={17} color={wellFg} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {item.label}
        </Text>
      </View>
      {item.right !== undefined ? (
        item.right
      ) : showChevron ? (
        <AppIcon
          name="chevron-right"
          size={18}
          color={isDark ? bankChrome.chevronDark : colors.mutedForeground}
          strokeWidth={2}
        />
      ) : null}
    </>
  );

  const row = item.onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={item.onPress}
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

/** @deprecated Prefer BankMenuRow — alias kept for profile screen imports. */
export type BankProfileMenuItem = BankMenuItem & {
  id: string;
  onPress: () => void;
  wellBg: string;
  wellFg: string;
};

export function BankProfileMenuRow({
  item,
  showDivider = true,
}: {
  item: BankProfileMenuItem;
  showDivider?: boolean;
}) {
  return <BankMenuRow item={item} showDivider={showDivider} />;
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
    minWidth: 0,
    gap: 3,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankChrome.rowPaddingX,
    marginRight: bankChrome.rowPaddingX,
  },
});
