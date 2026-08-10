import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

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
          color: isError ? colors.destructive : colors.foreground,
          backgroundColor: isError
            ? isDark
              ? "rgba(239,68,68,0.15)"
              : "#fef2f2"
            : isDark
              ? "rgba(255,255,255,0.08)"
              : "#f4f4f5",
          borderColor: isError
            ? isDark
              ? "rgba(239,68,68,0.35)"
              : "rgba(239,68,68,0.2)"
            : isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(15,23,42,0.08)",
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
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: authChrome.controlRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
