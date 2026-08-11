import * as Linking from "expo-linking";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { ReactNode, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBrandFooter } from "@/components/profile/AppBrandFooter";
import { openSupportEmail } from "@/components/profile/ProfileSettingPrimitives";
import { getSupportEmail, getSupportWhatsApp } from "@/lib/config";
import { useUiStore } from "@/stores/ui.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

const PANEL_WIDTH = 320;
const SUPPORT_EMAIL = getSupportEmail();

const ANIM_CONFIG = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
};

interface OptionRowProps {
  icon: AppIconName;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  showDivider?: boolean;
}

function OptionRow({
  icon,
  label,
  subtitle,
  onPress,
  right,
  showDivider = false,
}: OptionRowProps) {
  const { colors } = useTheme();

  const body = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: "transparent" }]}>
        <AppIcon name={icon} size={18} color={colors.mutedForeground} />
      </View>
      <View style={styles.rowCopy}>
        <Text
          style={[styles.rowLabel, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.rowSubtitle, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (
        <AppIcon
          name="chevron-right"
          size={16}
          color={colors.mutedForeground}
        />
      )}
    </>
  );

  const row = onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      {body}
    </Pressable>
  ) : (
    <View style={styles.row}>{body}</View>
  );

  return (
    <View>
      {row}
      {showDivider ? (
        <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
      ) : null}
    </View>
  );
}

function OptionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function ProfileOptionsPanel() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const optionsOpen = useUiStore((s) => s.optionsOpen);
  const closeOptions = useUiStore((s) => s.closeOptions);

  const [mounted, setMounted] = useState(false);

  const progress = useSharedValue(0);

  const finishClose = () => setMounted(false);

  useEffect(() => {
    if (optionsOpen) {
      setMounted(true);
      progress.value = withTiming(1, ANIM_CONFIG);
      return;
    }

    if (!mounted) return;

    progress.value = withTiming(0, ANIM_CONFIG, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [optionsOpen, mounted, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.62,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - progress.value) * PANEL_WIDTH }],
  }));

  const openChat = () => {
    closeOptions();
    Linking.openURL(`https://wa.me/${getSupportWhatsApp()}`);
  };

  const openContact = () => {
    closeOptions();
    openSupportEmail();
  };

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={closeOptions}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            style={StyleSheet.absoluteFill}
            onPress={closeOptions}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            panelStyle,
            {
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.lg,
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderCopy}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>
                Options
              </Text>
              <Text
                style={[
                  styles.panelSubtitle,
                  { color: colors.mutedForeground },
                ]}
              >
                Support & preferences
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close options"
              onPress={closeOptions}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.closePressed}
            >
              <AppIcon name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View
            style={[styles.headerRule, { backgroundColor: colors.border }]}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.panelScroll}
          >
            <OptionSection title="Support">
              <OptionRow
                icon="mail"
                label="Contact us"
                subtitle={SUPPORT_EMAIL}
                onPress={openContact}
                showDivider
              />
              <OptionRow
                icon="chat"
                label="Chat"
                subtitle="WhatsApp · Mon–Fri, 8am–6pm"
                onPress={openChat}
              />
            </OptionSection>
          </ScrollView>

          <AppBrandFooter />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  panel: {
    width: "84%",
    maxWidth: PANEL_WIDTH,
    borderLeftWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    shadowColor: "#000000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 24,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  panelHeaderCopy: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  panelTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.2,
  },
  panelSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
  },
  closePressed: {
    opacity: 0.7,
  },
  headerRule: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  panelScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginLeft: 2,
  },
  sectionBody: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 0,
    paddingVertical: 13,
    minHeight: 56,
  },
  rowPressed: {
    opacity: 0.82,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 34 + spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  rowSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: 16,
  },
});
