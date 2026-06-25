import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;

interface AccountInfoFieldProps {
  label: string;
  value?: string;
  onPress?: () => void;
  trailingIcon?: IoniconName;
  onTrailingPress?: () => void;
}

export function AccountInfoField({
  label,
  value,
  onPress,
  trailingIcon,
  onTrailingPress,
}: AccountInfoFieldProps) {
  const { colors } = useTheme();

  const card = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.copy}>
        {value ? (
          <>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {label}
            </Text>
            <Text
              style={[styles.value, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {value}
            </Text>
          </>
        ) : (
          <Text
            style={[styles.value, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {label}
          </Text>
        )}
      </View>
      {trailingIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onTrailingPress ?? onPress}
          hitSlop={10}
          style={({ pressed }) => [styles.trailing, pressed && styles.pressed]}
        >
          <Ionicons name={trailingIcon} size={18} color={colors.foreground} />
        </Pressable>
      ) : null}
    </View>
  );

  if (!onPress || trailingIcon) {
    return card;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 68,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
  },
  value: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  trailing: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
