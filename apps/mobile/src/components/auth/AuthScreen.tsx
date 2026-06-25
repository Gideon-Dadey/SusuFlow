import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing } from "@/theme/tokens";

interface AuthScreenProps {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  layout?: "scroll" | "bottom";
  panelStyle?: ViewStyle;
}

export function AuthScreen({
  children,
  footer,
  header,
  layout = "scroll",
  panelStyle,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (layout === "bottom") {
    return (
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.bottomRoot,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          {header ? <View style={styles.bottomHeader}>{header}</View> : null}
          <View style={styles.bottomSpacer} />
          <View
            style={[
              styles.bottomPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              panelStyle,
            ]}
          >
            {children}
            {footer ? <View style={styles.bottomFooter}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  footer: {
    marginTop: spacing.xxl,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  bottomRoot: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  bottomHeader: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  bottomSpacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  bottomPanel: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  bottomFooter: {
    marginTop: spacing.lg,
  },
});
