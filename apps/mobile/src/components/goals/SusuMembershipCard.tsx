import { TenantBrandMark } from "@/components/branding/TenantBrandMark";
import { StyleSheet, Text, View } from "react-native";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface SusuMembershipCardProps {
  groupName: string;
  logoUrl?: string | null;
  memberId?: string;
  isLoading?: boolean;
}

/** Quiet identity strip — matches More’s flat banking chrome. */
export function SusuMembershipCard({
  groupName,
  logoUrl,
  memberId,
  isLoading,
}: SusuMembershipCardProps) {
  const { colors, isDark } = useTheme();
  const divider = isDark ? bankChrome.dividerDark : bankChrome.dividerLight;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: divider,
        },
      ]}
    >
      <TenantBrandMark logoUrl={logoUrl} size={44} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.base,
    letterSpacing: -0.2,
  },
  memberId: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    marginTop: 2,
  },
});
