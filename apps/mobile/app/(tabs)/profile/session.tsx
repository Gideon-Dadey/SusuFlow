import { formatLastLoginLabel } from "@/lib/last-login";
import { ProfileFeaturePlaceholder } from "@/components/profile/ProfileFeaturePlaceholder";
import { useAuthStore } from "@/stores/auth.store";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

export default function SessionSummaryScreen() {
  const { colors } = useTheme();
  const lastLoginAt = useAuthStore((s) => s.lastLoginAt);
  const lastLoginLabel = formatLastLoginLabel(lastLoginAt);

  return (
    <ProfileFeaturePlaceholder
      title="Profile Session Summary"
      icon="smartphone"
      wellBg="#6B7358"
      wellFg="#1A1E14"
      headline="Your recent app activity"
      body="Track sign-ins and device sessions to keep your Susu account secure."
    >
      {lastLoginLabel ? (
        <Text style={[styles.meta, { color: colors.foreground }]}>
          {lastLoginLabel}
        </Text>
      ) : (
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          Sign in again to start recording session history.
        </Text>
      )}
    </ProfileFeaturePlaceholder>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
