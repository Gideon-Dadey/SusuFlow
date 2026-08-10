import { TenantBrandMark } from "@/components/branding/TenantBrandMark";
import { CardSurface } from "@/components/ui/CardSurface";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface SusuMembershipCardProps {
  groupName: string;
  logoUrl?: string | null;
  memberId?: string;
  isLoading?: boolean;
}

export function SusuMembershipCard({
  groupName,
  logoUrl,
  memberId,
  isLoading,
}: SusuMembershipCardProps) {
  const { colors } = useTheme();

  return (
    <CardSurface innerStyle={styles.card}>
      <TenantBrandMark logoUrl={logoUrl} size={48} />
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          Your susu
        </Text>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {isLoading ? "Loading…" : groupName}
        </Text>
        {memberId ? (
          <Text style={[styles.memberId, { color: colors.mutedForeground }]}>
            Member ID · {memberId}
          </Text>
        ) : null}
      </View>
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    letterSpacing: 0.2,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
    letterSpacing: -0.15,
  },
  memberId: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
});
