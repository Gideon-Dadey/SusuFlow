import { AppIcon } from "@/components/icons/AppIcon";
import { CardSurface } from "@/components/ui/CardSurface";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface SusuMembershipCardProps {
  groupName: string;
  memberId?: string;
  isLoading?: boolean;
}

export function SusuMembershipCard({
  groupName,
  memberId,
  isLoading,
}: SusuMembershipCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <CardSurface
      innerStyle={[
        styles.card,
        { backgroundColor: isDark ? colors.card : colors.primary50 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceGlow }]}>
        <AppIcon name="users" size={18} color={colors.primary} />
      </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
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
