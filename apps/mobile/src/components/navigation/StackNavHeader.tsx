import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { layout, spacing, typography } from "@/theme/tokens";

/**
 * Same top chrome as the More tab (`TabScreenLayout` sticky header):
 * safe-area + md, 44pt title row — keeps Chat / Messages aligned with More.
 */
export function StackNavHeader({
  title,
  onBack,
  right,
  ink = false,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Force black banking surface (support stack). */
  ink?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const pageBg = ink
    ? bankChrome.pageDark
    : isDark
      ? bankChrome.pageDark
      : bankChrome.pageLight;
  const fg = ink ? "#FFFFFF" : colors.foreground;

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.md,
          backgroundColor: pageBg,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          <BackArrowButton
            onPress={onBack ?? (() => router.back())}
            color={fg}
          />
        </View>
        <Text style={[styles.title, { color: fg }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.sideEnd]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.pageGutter,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  side: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 2,
  },
  sideEnd: {
    alignItems: "flex-end",
  },
  title: {
    flex: 1,
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.15,
    paddingHorizontal: spacing.xs,
  },
});
