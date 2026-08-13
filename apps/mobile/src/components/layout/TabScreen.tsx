import { ReactNode } from "react";
import {
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { CardSurface } from "@/components/ui/CardSurface";
import { tabBarScrollPadding } from "@/constants/tab-bar";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { layout, spacing, typography } from "@/theme/tokens";

interface TabScreenLayoutProps {
  header?: ReactNode;
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** @deprecated Quiet SusuFlow headers only — kept for call-site compatibility. */
  bankHeader?: boolean;
  /** @deprecated Unused. */
  headerDecoration?: boolean;
}

export function TabScreenLayout({
  header,
  children,
  refreshControl,
}: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const pageBg = isDark ? bankChrome.pageDark : bankChrome.pageLight;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {header ? (
        <View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + spacing.md,
              backgroundColor: pageBg,
            },
          ]}
        >
          {header}
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: spacing.md,
            paddingBottom: tabBarScrollPadding(insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </View>
  );
}

interface TabScreenHeaderProps {
  title: string;
  rightAction?: ReactNode;
  /** @deprecated Quiet headers always use foreground ink. */
  onGeometry?: boolean;
  /** Show a leading back control (e.g. Withdraw opened from Home). */
  showBack?: boolean;
}

export function TabScreenHeader({
  title,
  rightAction,
  showBack = false,
}: TabScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      {showBack ? (
        <View style={styles.headerLeading}>
          <BackArrowButton
            onPress={() => router.back()}
            color={colors.foreground}
          />
        </View>
      ) : null}
      <Text
        style={[styles.headerTitle, { color: colors.foreground }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {rightAction ? (
        <View style={styles.headerAction}>{rightAction}</View>
      ) : null}
    </View>
  );
}

interface TabScreenSectionProps {
  title: string;
  children: ReactNode;
}

/** More / Goals / Activity section eyebrow — uppercase banking chrome. */
export function TabSectionLabel({
  children,
  spaced,
}: {
  children: string;
  spaced?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.sectionLabel,
        spaced && styles.sectionLabelSpaced,
        { color: colors.mutedForeground },
      ]}
    >
      {children}
    </Text>
  );
}

export function TabScreenSection({ title, children }: TabScreenSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <CardSurface innerStyle={styles.sectionCard}>{children}</CardSurface>
    </View>
  );
}

export function TabScreenDivider() {
  const { isDark } = useTheme();
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: isDark
            ? bankChrome.dividerDark
            : bankChrome.dividerLight,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  stickyHeader: {
    paddingHorizontal: layout.pageGutter,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: layout.pageGutter,
    gap: spacing.lg,
  },
  header: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 48,
    right: 48,
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.15,
  },
  headerLeading: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 2,
  },
  headerAction: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    marginLeft: 4,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionLabelSpaced: {
    marginTop: spacing.lg,
  },
  sectionCard: {
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
});
