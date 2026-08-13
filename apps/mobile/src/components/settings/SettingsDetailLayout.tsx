import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { tabBarScrollPadding } from "@/constants/tab-bar";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { layout, spacing, typography } from "@/theme/tokens";

interface SettingsDetailLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  keyboardAvoid?: boolean;
  /** Pure black professional surface (account / personal details). */
  surface?: "default" | "ink";
}

export function SettingsDetailLayout({
  title,
  subtitle,
  children,
  keyboardAvoid = false,
  surface = "default",
}: SettingsDetailLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const ink = surface === "ink";
  const pageBg = ink
    ? bankChrome.pageDark
    : isDark
      ? bankChrome.pageDark
      : bankChrome.pageLight;
  const titleColor = ink ? "#FFFFFF" : colors.foreground;
  const subtitleColor = ink ? "rgba(255,255,255,0.55)" : colors.mutedForeground;
  const backColor = ink ? "#FFFFFF" : colors.foreground;

  const body = (
    <View style={styles.flex}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: insets.top + 4,
            backgroundColor: pageBg,
          },
        ]}
      >
        <View style={styles.navSide}>
          <BackArrowButton onPress={() => router.back()} color={backColor} />
        </View>
        <Text
          style={[styles.navTitle, { color: titleColor }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={styles.navSide} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: tabBarScrollPadding(insets.bottom),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: subtitleColor,
                paddingHorizontal: layout.pageGutter,
                paddingTop: spacing.md,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}

        <View
          style={[
            styles.content,
            { paddingTop: subtitle ? spacing.sm : spacing.md },
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {keyboardAvoid ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </View>
  );
}

/** Flat bank panel — no card border (matches profile / More). */
export function SettingsPanel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  flex: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: layout.pageGutter,
    paddingBottom: spacing.sm,
    zIndex: 2,
  },
  navSide: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 2,
  },
  navTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.2,
    paddingHorizontal: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: layout.pageGutter,
  },
  panel: {
    overflow: "hidden",
  },
});
