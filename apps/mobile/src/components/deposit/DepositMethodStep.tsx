import { AppIcon } from "@/components/icons/AppIcon";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  DEPOSIT_BANKS,
  DEPOSIT_METHODS,
  isDepositBankTransfer,
} from "@/components/deposit/depositUtils";
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
        {DEPOSIT_METHODS.map((item) => {
          const selected = method === item.id;
          const iconBg = selected
            ? isDark
              ? "rgba(16, 185, 129, 0.14)"
              : colors.primary50
            : colors.muted;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectMethod(item.id)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: selected ? colors.primary : colors.border,
                },
                selected && styles.cardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <AppIcon
                  name={item.icon}
                  size={18}
                  color={selected ? colors.primary : colors.mutedForeground}
                />
              </View>
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
                    borderColor: selected ? colors.primary : colors.border,
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
                borderColor: colors.border,
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

          <View style={styles.bankList}>
            {filteredBanks.map((bank) => {
              const selected = bankCode === bank.code;
              return (
                <Pressable
                  key={bank.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelectBank(bank.code)}
                  style={({ pressed }) => [
                    styles.bankRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                    selected && styles.cardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.bankBadge,
                      {
                        backgroundColor: selected
                          ? isDark
                            ? "rgba(16, 185, 129, 0.14)"
                            : colors.primary50
                          : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bankBadgeText,
                        {
                          color: selected
                            ? colors.primary
                            : colors.mutedForeground,
                        },
                      ]}
                    >
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
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    minHeight: 72,
  },
  cardSelected: {
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.86,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  subtitle: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 16,
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
  bankList: {
    gap: 8,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  bankBadge: {
    width: 40,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  bankBadgeText: {
    fontFamily: typography.roles.title,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  bankName: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  emptyBanks: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
});
