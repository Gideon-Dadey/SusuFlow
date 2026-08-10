import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { surfaceRadius } from "@/theme/tokens";

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
}

export function Button({
  title,
  loading,
  variant = "primary",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors, typography, isDark } = useTheme();
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: surfaceRadius.control },
        isPrimary && {
          backgroundColor: pressed
            ? isDark
              ? "#e4e4e7"
              : "#1a1a1a"
            : colors.primary,
        },
        variant === "secondary" && { backgroundColor: colors.muted },
        isOutline && {
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.primary,
        },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && !isPrimary && styles.pressed,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.primaryForeground : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            {
              fontFamily: typography.roles.label,
              fontSize: typography.size.sm,
            },
            isPrimary && { color: colors.primaryForeground },
            isOutline && { color: colors.primary },
            !isPrimary && !isOutline && { color: colors.foreground },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {},
});
