import {
  MobileMoneyMark,
  hasPaymentMethodMark,
} from "@/components/payments/MobileMoneyMark";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Input } from "@/components/Input";
import { AppIcon } from "@/components/icons/AppIcon";
import { WITHDRAW_METHODS } from "@/components/withdraw/withdrawUtils";
import { bankChrome, getWellForIcon } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface WithdrawMethodStepProps {
  method: string;
  phone: string;
  onSelectMethod: (methodId: string) => void;
  onChangePhone: (value: string) => void;
}

export function WithdrawMethodStep({
  method,
  phone,
  onSelectMethod,
  onChangePhone,
}: WithdrawMethodStepProps) {
  const { colors, isDark } = useTheme();
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Where should we send it?
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
        Payouts go to your mobile money wallet after staff approval.
      </Text>

      <View
        style={[
          styles.phoneCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Input
          label="Mobile money number"
          value={phone}
          onChangeText={onChangePhone}
          keyboardType="phone-pad"
          placeholder="055 123 4567"
          autoComplete="tel"
        />
      </View>

      <View style={styles.list}>
        {WITHDRAW_METHODS.map((item, index) => {
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
                  <MobileMoneyMark
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
              {index < WITHDRAW_METHODS.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: divider }]} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  heading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.3,
  },
  subheading: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  phoneCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
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
    borderRadius: radius.md,
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
});
