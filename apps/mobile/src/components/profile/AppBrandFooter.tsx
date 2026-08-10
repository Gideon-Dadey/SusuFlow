import { Image, StyleSheet, Text, View } from "react-native";
import { appVersion } from "@/lib/app-version";
import { BRAND_LOGO } from "@/lib/brand-assets";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

export function AppBrandFooter() {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        SusuFlow Ghana · v{appVersion}
      </Text>
      <Image source={BRAND_LOGO} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
  },
  logo: {
    width: 58,
    height: 22,
  },
});
