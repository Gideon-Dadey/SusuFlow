import { StyleSheet, Text, View } from "react-native";
import { AvatarEditor } from "@/components/profile/AvatarEditor";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface AccountIdentityHeroProps {
  initials: string;
  displayName: string;
  email?: string;
  clientId?: string;
  seed?: string;
  imageUrl?: string | null;
  /** When true, show camera controls to change/remove photo */
  editableAvatar?: boolean;
  loading?: boolean;
}

export function AccountIdentityHero({
  initials,
  displayName,
  email,
  clientId,
  seed,
  imageUrl,
  editableAvatar = false,
  loading = false,
}: AccountIdentityHeroProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {editableAvatar ? (
        <AvatarEditor
          initials={initials}
          displayName={displayName}
          imageUrl={imageUrl}
        />
      ) : (
        <UserAvatar
          initials={initials}
          seed={seed ?? displayName}
          imageUrl={imageUrl}
          size="xl"
          loading={loading}
          showVerified
        />
      )}

      <View style={styles.copy}>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {displayName}
        </Text>
        {email ? (
          <Text
            style={[styles.meta, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {email}
          </Text>
        ) : null}
      </View>

      <View style={[styles.chip, { backgroundColor: colors.primary50 }]}>
        <Text style={[styles.chipLabel, { color: colors.primary700 }]}>
          Verified member
        </Text>
      </View>

      {clientId ? (
        <Text style={[styles.clientId, { color: colors.mutedForeground }]}>
          Client ID · {clientId}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
    overflow: "hidden",
  },
  copy: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  name: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.xl,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  chipLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.2,
  },
  clientId: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    letterSpacing: 0.3,
  },
});
