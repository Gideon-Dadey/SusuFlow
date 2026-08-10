import {
  PaymentMethodMark,
  hasPaymentMethodMark,
} from "@/components/payments/MobileMoneyMark";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  DEPOSIT_BANKS,
  DEPOSIT_METHODS,
  isDepositBankTransfer,
} from "@/components/deposit/depositUtils";
import { AppIcon } from "@/components/icons/AppIcon";
import { bankChrome, getWellForIcon } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface DepositMethodStepProps {
  method: string;
  bankCode: string | null;
  onSelectMethod: (methodId: string) => void;
  onSelectBank: (bankCode: string) => void;
}

export function DepositMethodStep({
  method,
  bankCode,
  onSelectMethod,
  onSelectBank,
}: DepositMethodStepProps) {
  const { colors, isDark } = useTheme();
  const [bankQuery, setBankQuery] = useState("");
  const showBanks = isDepositBankTransfer(method);
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return DEPOSIT_BANKS;
    return DEPOSIT_BANKS.filter(
      (bank) =>
        bank.name.toLowerCase().includes(q) ||
        bank.code.toLowerCase().includes(q),
    );
  }, [bankQuery]);

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Choose how to pay
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
        Mobile money or bank transfer — secured through our payment partner.
      </Text>

      <View style={styles.list}>
        {DEPOSIT_METHODS.map((item, index) => {
          const selected = method === item.id;
          const well = getWellForIcon(item.icon, isDark);
          const isMarked = hasPaymentMethodMark(item.id);

          return (
            <View key={item.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onSelectMethod(item.id)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.pressed,
                  selected && {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.03)",
                  },
                ]}
              >
                {isMarked ? (
                  <PaymentMethodMark
                    methodId={item.id}
                    size={bankChrome.wellSize}
                  />
                ) : (
                  <View style={[styles.iconWrap, { backgroundColor: well.bg }]}>
                    <AppIcon
                      name={item.icon}
                      size={17}
                      color={well.fg}
                      strokeWidth={2}
                    />
                  </View>
                )}
                <View style={styles.copy}>
                  <Text style={[styles.title, { color: colors.foreground }]}>
                    {item.label}
                  </Text>
                  <Text
                    style={[styles.subtitle, { color: colors.mutedForeground }]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: selected ? colors.primary : divider,
                    },
                  ]}
                >
                  {selected ? (
                    <View
                      style={[
                        styles.radioFill,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  ) : null}
                </View>
              </Pressable>
              {index < DEPOSIT_METHODS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: divider }]} />
              ) : null}
            </View>
          );
        })}
      </View>

      {showBanks ? (
        <View style={styles.bankSection}>
          <Text style={[styles.bankHeading, { color: colors.foreground }]}>
            Select your bank
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            Choose the bank you&apos;ll pay from. We&apos;ll route you through a
            verified checkout.
          </Text>

          <View
            style={[
              styles.searchWrap,
              {
                backgroundColor: colors.card,
                borderColor: divider,
              },
            ]}
          >
            <AppIcon name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              value={bankQuery}
              onChangeText={setBankQuery}
              placeholder="Search banks"
              placeholderTextColor={colors.mutedForeground}
              autoCorrect={false}
              autoCapitalize="none"
              style={[styles.searchInput, { color: colors.foreground }]}
            />
          </View>

          <View>
            {filteredBanks.map((bank, index) => {
              const selected = bankCode === bank.code;
              const well = getWellForIcon("building", isDark);
              return (
                <View key={bank.code}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => onSelectBank(bank.code)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.pressed,
                      selected && {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.03)",
                      },
                    ]}
                  >
                    <View
                      style={[styles.iconWrap, { backgroundColor: well.bg }]}
                    >
                      <Text style={[styles.bankBadgeText, { color: well.fg }]}>
                        {bank.code.slice(0, 3)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.bankName, { color: colors.foreground }]}
                      numberOfLines={1}
                    >
                      {bank.name}
                    </Text>
                    {selected ? (
                      <AppIcon
                        name="badge-check"
                        size={16}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                  {index < filteredBanks.length - 1 ? (
                    <View
                      style={[styles.divider, { backgroundColor: divider }]}
                    />
                  ) : null}
                </View>
              );
            })}
            {filteredBanks.length === 0 ? (
              <Text
                style={[styles.emptyBanks, { color: colors.mutedForeground }]}
              >
                No banks match that search.
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  heading: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.base,
    letterSpacing: -0.15,
  },
  subheading: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  list: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: bankChrome.rowGap,
    paddingVertical: bankChrome.rowPaddingY,
    paddingHorizontal: spacing.xs,
    minHeight: bankChrome.rowMinHeight,
  },
  pressed: {
    opacity: 0.86,
  },
  iconWrap: {
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
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: bankChrome.subtitleSize,
    lineHeight: 17,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: bankChrome.wellSize + bankChrome.rowGap + spacing.xs,
  },
  bankSection: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bankHeading: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.roles.body,
    fontSize: typography.size.sm,
    paddingVertical: spacing.sm,
  },
  bankBadgeText: {
    fontFamily: typography.roles.title,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  bankName: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: bankChrome.labelSize,
  },
  emptyBanks: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
});
