import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { homeChrome } from "@/components/home/homeChrome";
import { HOME_PROMO_IMAGES } from "@/lib/brand-assets";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
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
  image: ImageSourcePropType;
  onPress: () => void;
}

interface HomePromoCarouselProps {
  groupName?: string;
  onDeposit: () => void;
  onGoals: () => void;
  onActivity: () => void;
}

const CARD_GAP = spacing.md;
const CARD_HEIGHT = 168;
/** Dwell time per slide before auto-advance */
const AUTO_ADVANCE_MS = 4500;
/** After a manual swipe, wait this long before resuming autoplay */
const RESUME_AFTER_INTERACTION_MS = 5000;

export function HomePromoCarousel({
  groupName,
  onDeposit,
  onGoals,
  onActivity,
}: HomePromoCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const draggingRef = useRef(false);
  const resumeAtRef = useRef(0);
  const appActiveRef = useRef(AppState.currentState === "active");

  const cardWidth = Math.round(screenWidth - spacing.lg * 2 - 20);
  const pageWidth = cardWidth + CARD_GAP;

  const cards = useMemo<PromoCard[]>(
    () => [
      {
        id: "deposit",
        title: "Ready to save today?",
        body: "Deposit any amount — small steps add up to real goals.",
        cta: "Start a deposit",
        icon: "wallet",
        image: HOME_PROMO_IMAGES.deposit,
        onPress: onDeposit,
      },
      {
        id: "grow",
        title: "Stay consistent",
        body: "Regular deposits help your susu grow steadily over time.",
        cta: "View activity",
        icon: "activity",
        image: HOME_PROMO_IMAGES.grow,
        onPress: onActivity,
      },
      {
        id: "goals",
        title: groupName ? `Save with ${groupName}` : "Set a savings goal",
        body: "Join a plan and track progress toward your target.",
        cta: "View goals",
        icon: "target",
        image: HOME_PROMO_IMAGES.goals,
        onPress: onGoals,
      },
    ],
    [groupName, onActivity, onDeposit, onGoals],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.min(Math.max(index, 0), cards.length - 1);
      scrollRef.current?.scrollTo({
        x: clamped * pageWidth,
        animated,
      });
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [cards.length, pageWidth],
  );

  const syncIndexFromOffset = useCallback(
    (offsetX: number) => {
      const index = Math.round(offsetX / pageWidth);
      const clamped = Math.min(Math.max(index, 0), cards.length - 1);
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [cards.length, pageWidth],
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [syncIndexFromOffset],
  );

  const markInteracted = useCallback(() => {
    resumeAtRef.current = Date.now() + RESUME_AFTER_INTERACTION_MS;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (cards.length < 2) return undefined;

      const tick = () => {
        if (!appActiveRef.current) return;
        if (draggingRef.current) return;
        if (Date.now() < resumeAtRef.current) return;
        const next = (activeIndexRef.current + 1) % cards.length;
        scrollToIndex(next, true);
      };

      const intervalId = setInterval(tick, AUTO_ADVANCE_MS);
      const appSub = AppState.addEventListener("change", (state) => {
        appActiveRef.current = state === "active";
        if (state === "active") {
          // Give the slide a full dwell after returning to the app
          resumeAtRef.current = Date.now() + AUTO_ADVANCE_MS;
        }
      });

      return () => {
        clearInterval(intervalId);
        appSub.remove();
      };
    }, [cards.length, scrollToIndex]),
  );

  const activeDot = isDark ? homeChrome.linkDark : homeChrome.link;

  return (
    <View style={styles.section}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          draggingRef.current = true;
          markInteracted();
        }}
        onScrollEndDrag={() => {
          draggingRef.current = false;
          markInteracted();
        }}
        onMomentumScrollEnd={(event) => {
          draggingRef.current = false;
          syncIndexFromOffset(event.nativeEvent.contentOffset.x);
          markInteracted();
        }}
      >
        {cards.map((card) => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            onPress={card.onPress}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <View
              style={[
                styles.cardShell,
                { width: cardWidth, height: CARD_HEIGHT },
                !isDark && shadows.card,
              ]}
            >
              <ImageBackground
                source={card.image}
                style={{ width: cardWidth, height: CARD_HEIGHT }}
                imageStyle={styles.photo}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              >
                <LinearGradient
                  colors={[
                    "rgba(15, 23, 42, 0.55)",
                    "rgba(15, 23, 42, 0.18)",
                    "transparent",
                  ]}
                  locations={[0, 0.38, 0.7]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />

                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardBody}>{card.body}</Text>
                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>{card.cta}</Text>
                    <AppIcon name="chevron-right" size={14} color="#ffffff" />
                  </View>
                </View>
              </ImageBackground>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots} accessibilityRole="tablist">
        {cards.map((card, index) => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            accessibilityLabel={`Go to promo ${index + 1}`}
            accessibilityState={{ selected: index === activeIndex }}
            hitSlop={8}
            onPress={() => {
              markInteracted();
              scrollToIndex(index, true);
            }}
            style={[
              styles.dot,
              index === activeIndex
                ? [styles.dotActive, { backgroundColor: activeDot }]
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
  cardShell: {
    borderRadius: surfaceRadius.card,
    overflow: "hidden",
    backgroundColor: "#334155",
  },
  photo: {
    borderRadius: surfaceRadius.card,
  },
  cardCopy: {
    flex: 1,
    justifyContent: "flex-end",
    maxWidth: "62%",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    gap: 5,
  },
  cardTitle: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.sm,
    color: "#ffffff",
    letterSpacing: -0.25,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    color: "rgba(255, 255, 255, 0.92)",
    lineHeight: 17,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  pressed: {
    opacity: 0.96,
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
