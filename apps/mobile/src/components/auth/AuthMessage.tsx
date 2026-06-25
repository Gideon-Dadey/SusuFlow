import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

interface AuthMessageProps {
  message: string;
  variant: "error" | "success";
}

export function AuthMessage({ message, variant }: AuthMessageProps) {
  const { colors, isDark } = useTheme();
  const isError = variant === "error";

  return (
    <Text
      style={[
        styles.base,
        {
          color: isError ? colors.destructive : colors.primary700,
          backgroundColor: isError
            ? isDark
              ? "rgba(239,68,68,0.15)"
              : "#fef2f2"
            : isDark
              ? colors.surfaceGlow
              : "#f0fdf4",
        },
      ]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    padding: 12,
    borderRadius: radius.md,
  },
});
