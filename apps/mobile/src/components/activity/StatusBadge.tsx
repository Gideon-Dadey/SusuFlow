import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

const STATUS_VARIANTS: Record<
  string,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  completed: {
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#15803d",
    darkBg: "rgba(74, 222, 128, 0.12)",
    darkText: "#4ade80",
  },
  success: {
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#15803d",
    darkBg: "rgba(74, 222, 128, 0.12)",
    darkText: "#4ade80",
  },
  pending: {
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#b45309",
    darkBg: "rgba(251, 191, 36, 0.12)",
    darkText: "#fbbf24",
  },
  processing: {
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#b45309",
    darkBg: "rgba(251, 191, 36, 0.12)",
    darkText: "#fbbf24",
  },
  requested: {
    bg: "rgba(245, 158, 11, 0.12)",
    text: "#b45309",
    darkBg: "rgba(251, 191, 36, 0.12)",
    darkText: "#fbbf24",
  },
  failed: {
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#dc2626",
    darkBg: "rgba(248, 113, 113, 0.12)",
    darkText: "#f87171",
  },
  rejected: {
    bg: "rgba(239, 68, 68, 0.12)",
    text: "#dc2626",
    darkBg: "rgba(248, 113, 113, 0.12)",
    darkText: "#f87171",
  },
};

function formatStatusLabel(status: string): string {
  if (status === "offline_pending") return "Offline queue";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: string }) {
  const { isDark } = useTheme();
  const variant = STATUS_VARIANTS[status] || {
    bg: "rgba(148, 163, 184, 0.15)",
    text: "#64748b",
    darkBg: "rgba(155, 155, 166, 0.15)",
    darkText: "#9b9ba6",
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? variant.darkBg : variant.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isDark ? variant.darkText : variant.text },
        ]}
      >
        {formatStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    textTransform: "capitalize",
  },
});
