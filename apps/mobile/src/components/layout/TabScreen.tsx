import { ReactNode } from "react";
import {
  RefreshControl,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardSurface } from "@/components/ui/CardSurface";
import { HeaderArcDecoration } from "@/components/ui/HeaderArcDecoration";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface TabScreenLayoutProps {
  header?: ReactNode;
  children: ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  headerDecoration?: boolean;
}

export function TabScreenLayout({
  header,
  children,
  refreshControl,
  headerDecoration = false,
}: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {headerDecoration ? <HeaderArcDecoration /> : null}

      {header ? (
        <View
          style={[
            styles.stickyHeader,
            {
              paddingTop: insets.top + spacing.md,
              backgroundColor: colors.background,
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
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + 110,
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
}

export function TabScreenHeader({ title, rightAction }: TabScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
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
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  stickyHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: 22,
  },
  header: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
    letterSpacing: -0.15,
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
  sectionCard: {
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg,
  },
});
