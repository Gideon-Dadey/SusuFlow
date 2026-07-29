import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import {
  radius,
  shadows,
  spacing,
  typography,
  surfaceRadius,
} from "@/theme/tokens";

interface PromoCard {
  id: string;
  title: string;
  body: string;
  cta: string;
  icon: AppIconName;
  gradient: readonly [string, string];
  accent: string;
  onPress: () => void;
}

interface HomePromoCarouselProps {
  groupName?: string;
  onDeposit: () => void;
  onGoals: () => void;
  onActivity: () => void;
}

const CARD_GAP = spacing.md;

export function HomePromoCarousel({
  groupName,
  onDeposit,
  onGoals,
  onActivity,
}: HomePromoCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { isDark, colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = screenWidth - spacing.lg * 2 - 20;

  const cards = useMemo<PromoCard[]>(
    () => [
      {
        id: "deposit",
        title: "Ready to save today?",
        body: "Deposit any amount — small steps add up to real goals.",
        cta: "Start a deposit",
        icon: "wallet",
        gradient: isDark
          ? (["#1e3a5f", "#0f2744"] as const)
          : (["#1a365d", "#234876"] as const),
        accent: "rgba(255, 255, 255, 0.14)",
        onPress: onDeposit,
      },
      {
        id: "grow",
        title: "Stay consistent",
        body: "Regular deposits help your susu grow steadily over time.",
        cta: "View activity",
        icon: "activity",
        gradient: isDark
          ? (["#002359", "#003585"] as const)
          : (["#0043aa", "#0056d2"] as const),
        accent: "rgba(255, 255, 255, 0.12)",
        onPress: onActivity,
      },
      {
        id: "goals",
        title: groupName ? `Save with ${groupName}` : "Set a savings goal",
        body: "Join a plan and track progress toward your target.",
        cta: "View goals",
        icon: "target",
        gradient: isDark
          ? (["#3b2f4a", "#1f1a28"] as const)
          : (["#5b4b8a", "#4338ca"] as const),
        accent: "rgba(255, 255, 255, 0.12)",
        onPress: onGoals,
      },
    ],
    [groupName, isDark, onActivity, onDeposit, onGoals],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / (cardWidth + CARD_GAP));
      setActiveIndex(Math.min(Math.max(index, 0), cards.length - 1));
    },
    [cardWidth, cards.length],
  );

  return (
    <View style={styles.section}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {cards.map((card) => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            onPress={card.onPress}
            style={({ pressed }) => [
              styles.cardPressable,
              { width: cardWidth },
              !isDark && shadows.card,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={[...card.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View
                style={[
                  styles.decorCircle,
                  styles.decorLarge,
                  { backgroundColor: card.accent },
                ]}
              />
              <View
                style={[
                  styles.decorCircle,
                  styles.decorSmall,
                  { backgroundColor: card.accent },
                ]}
              />

              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardBody}>{card.body}</Text>
                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>{card.cta}</Text>
                  <AppIcon name="chevron-right" size={14} color="#ffffff" />
                </View>
              </View>

              <View style={styles.iconBadge}>
                <AppIcon name={card.icon} size={22} color="#ffffff" />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {cards.map((card, index) => (
          <View
            key={card.id}
            style={[
              styles.dot,
              index === activeIndex
                ? [styles.dotActive, { backgroundColor: colors.primary }]
                : [
                    styles.dotIdle,
                    {
                      backgroundColor: isDark
                        ? "rgba(142, 142, 147, 0.5)"
                        : "rgba(148, 163, 184, 0.45)",
                    },
                  ],
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginHorizontal: -spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: CARD_GAP,
  },
  cardPressable: {
    borderRadius: surfaceRadius.card,
    overflow: "hidden",
  },
  card: {
    minHeight: 132,
    borderRadius: surfaceRadius.card,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  decorCircle: {
    position: "absolute",
    borderRadius: radius.full,
  },
  decorLarge: {
    width: 120,
    height: 120,
    right: -28,
    top: -36,
  },
  decorSmall: {
    width: 64,
    height: 64,
    right: 48,
    bottom: -20,
  },
  cardCopy: {
    flex: 1,
    gap: 6,
    paddingRight: 52,
    zIndex: 1,
  },
  cardTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  cardBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    color: "rgba(255, 255, 255, 0.82)",
    lineHeight: 17,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  ctaText: {
    fontFamily: typography.roles.label,
    fontSize: typography.size.xs,
    color: "#ffffff",
  },
  iconBadge: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: surfaceRadius.chip,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    zIndex: 1,
  },
  pressed: {
    opacity: 0.94,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
  },
  dot: {
    height: 6,
    borderRadius: radius.full,
  },
  dotActive: {
    width: 18,
  },
  dotIdle: {
    width: 6,
  },
});
