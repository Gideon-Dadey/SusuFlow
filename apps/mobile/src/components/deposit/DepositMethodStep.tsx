import { AppIcon } from "@/components/icons/AppIcon";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DEPOSIT_METHODS } from "@/components/deposit/depositUtils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface DepositMethodStepProps {
  method: string;
  onSelectMethod: (methodId: string) => void;
}

export function DepositMethodStep({
  method,
  onSelectMethod,
}: DepositMethodStepProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Choose how to pay
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
        You&apos;ll approve the charge on your mobile money wallet.
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
});
