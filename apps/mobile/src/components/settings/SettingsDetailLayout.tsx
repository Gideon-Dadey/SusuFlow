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
import { HeaderArcDecoration } from "@/components/ui/HeaderArcDecoration";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface SettingsDetailLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  keyboardAvoid?: boolean;
}

export function SettingsDetailLayout({
  title,
  subtitle,
  children,
  keyboardAvoid = false,
}: SettingsDetailLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const body = (
    <View style={styles.flex}>
      <HeaderArcDecoration />
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <View style={styles.navBar}>
          <View style={styles.navSide}>
            <BackArrowButton onPress={() => router.back()} />
          </View>
          <Text
            style={[styles.navTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.navSide} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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

export function SettingsPanel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  flex: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 2,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
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
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  content: {
    gap: spacing.md,
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});
