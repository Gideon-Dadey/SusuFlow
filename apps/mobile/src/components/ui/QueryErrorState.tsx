import { StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export function QueryErrorState({
  title = "Couldn’t load this",
  message = "Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      accessibilityRole="alert"
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isDark ? "rgba(225,29,72,0.16)" : "#FFF1F2",
          },
        ]}
      >
        <AppIcon name="alert-circle" size={22} color={colors.destructive} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.mutedForeground }]}>
        {message}
      </Text>
      <Button title="Try again" onPress={onRetry} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.base,
    textAlign: "center",
  },
  message: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
});
