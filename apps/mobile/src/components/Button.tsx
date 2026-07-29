import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

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
  const { colors, radius, typography } = useTheme();
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: radius.lg },
        isPrimary && { backgroundColor: pressed ? "#0043aa" : "#0056d2" },
        variant === "secondary" && { backgroundColor: colors.muted },
        isOutline && {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
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
