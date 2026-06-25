import { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface ScreenHeaderProps {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: ViewStyle;
}

export function useScreenHeaderPaddingTop(): number {
  const insets = useSafeAreaInsets();
  return insets.top + spacing.md;
}

export function ScreenHeader({
  title,
  leading,
  trailing,
  style,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const paddingTop = useScreenHeaderPaddingTop();

  return (
    <View
      style={[
        styles.shell,
        {
          paddingTop,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <View style={styles.bar}>
        <Text
          style={[styles.title, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  bar: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.15,
  },
  leading: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 1,
  },
  trailing: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "flex-end",
    zIndex: 1,
  },
});
