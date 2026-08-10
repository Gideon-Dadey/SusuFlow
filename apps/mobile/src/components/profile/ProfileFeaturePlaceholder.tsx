import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import {
  SettingsDetailLayout,
  SettingsPanel,
} from "@/components/settings/SettingsDetailLayout";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ProfileFeaturePlaceholderProps {
  title: string;
  icon: AppIconName;
  headline: string;
  body: string;
  wellBg: string;
  wellFg: string;
  children?: ReactNode;
}

/** Polished empty state for profile features that ship as menu destinations. */
export function ProfileFeaturePlaceholder({
  title,
  icon,
  headline,
  body,
  wellBg,
  wellFg,
  children,
}: ProfileFeaturePlaceholderProps) {
  const { colors } = useTheme();

  return (
    <SettingsDetailLayout title={title}>
      <SettingsPanel>
        <View style={styles.panel}>
          <View style={[styles.well, { backgroundColor: wellBg }]}>
            <AppIcon name={icon} size={28} color={wellFg} strokeWidth={1.75} />
          </View>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            {headline}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {body}
          </Text>
          {children}
        </View>
      </SettingsPanel>
    </SettingsDetailLayout>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  well: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  headline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 18,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
