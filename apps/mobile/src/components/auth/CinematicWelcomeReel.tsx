import { useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** Time the frame holds before the dissolve begins. */
export const WELCOME_HOLD_MS = 4200;
/** Soft overlap so the next frame is already moving in. */
export const WELCOME_CROSSFADE_MS = 1400;
export const WELCOME_SLIDE_MS = WELCOME_HOLD_MS + WELCOME_CROSSFADE_MS;

type KenDirection = {
  fromScale: number;
  toScale: number;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
};

/** Alternating camera paths so consecutive frames feel like edited video. */
const KEN_DIRS: KenDirection[] = [
  { fromScale: 1.08, toScale: 1.18, fromX: -18, toX: 14, fromY: 10, toY: -16 },
  { fromScale: 1.16, toScale: 1.08, fromX: 16, toX: -12, fromY: -12, toY: 14 },
  { fromScale: 1.1, toScale: 1.2, fromX: -10, toX: 18, fromY: 8, toY: -10 },
];

interface ReelFrameProps {
  source: ImageSourcePropType;
  index: number;
  activeIndex: number;
  slideCount: number;
}

function ReelFrame({ source, index, activeIndex, slideCount }: ReelFrameProps) {
  const visibility = useSharedValue(index === activeIndex ? 1 : 0);
  const ken = useSharedValue(0);
  const dir = KEN_DIRS[index % KEN_DIRS.length];

  useEffect(() => {
    const isActive = index === activeIndex;
    const isPrev =
      index === (activeIndex - 1 + slideCount) % slideCount && slideCount > 1;

    if (isActive) {
      visibility.value = withTiming(1, {
        duration: WELCOME_CROSSFADE_MS,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
      cancelAnimation(ken);
      ken.value = 0;
      ken.value = withTiming(1, {
        duration: WELCOME_SLIDE_MS,
        easing: Easing.linear,
      });
      return;
    }

    if (isPrev) {
      // Keep drifting while dissolving out — feels like a cut, not a hard swap.
      visibility.value = withTiming(0, {
        duration: WELCOME_CROSSFADE_MS,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      return;
    }

    visibility.value = withTiming(0, {
      duration: Math.min(480, WELCOME_CROSSFADE_MS),
      easing: Easing.out(Easing.cubic),
    });
    cancelAnimation(ken);
    ken.value = 0;
  }, [activeIndex, index, ken, slideCount, visibility]);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(
      ken.value,
      [0, 1],
      [dir.fromScale, dir.toScale],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      ken.value,
      [0, 1],
      [dir.fromX, dir.toX],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      ken.value,
      [0, 1],
      [dir.fromY, dir.toY],
      Extrapolation.CLAMP,
    );
    // Slight lift on exit so the incoming plate feels layered.
    const exitLift = interpolate(
      visibility.value,
      [0, 1],
      [1.04, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: visibility.value,
      transform: [{ scale: scale * exitLift }, { translateX }, { translateY }],
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, style]}
      pointerEvents="none"
    >
      <Image source={source} style={styles.image} resizeMode="cover" />
    </Animated.View>
  );
}

interface ProgressSegmentProps {
  active: boolean;
  playing: boolean;
}

function ProgressSegment({ active, playing }: ProgressSegmentProps) {
  const fill = useSharedValue(active && playing ? 0 : active ? 1 : 0);
  const trackWidth = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(fill);
    if (!active) {
      fill.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }
    fill.value = 0;
    fill.value = withTiming(1, {
      duration: WELCOME_SLIDE_MS,
      easing: Easing.linear,
    });
  }, [active, fill, playing]);

  const fillStyle = useAnimatedStyle(() => ({
    width: interpolate(
      fill.value,
      [0, 1],
      [0, Math.max(trackWidth.value, 1)],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View
      style={styles.segmentTrack}
      onLayout={(event) => {
        trackWidth.value = event.nativeEvent.layout.width;
      }}
    >
      <Animated.View style={[styles.segmentFill, fillStyle]} />
    </View>
  );
}

interface CinematicWelcomeReelProps {
  sources: readonly ImageSourcePropType[];
  activeIndex: number;
}

/**
 * Full-bleed lifestyle reel: continuous Ken Burns + soft dissolve cuts.
 * Same stills, timed like a short branded film loop.
 */
export function CinematicWelcomeReel({
  sources,
  activeIndex,
}: CinematicWelcomeReelProps) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withDelay(
      400,
      withRepeat(
        withTiming(1, {
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, [breath]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      breath.value,
      [0, 1],
      [0.04, 0.12],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={StyleSheet.absoluteFill} accessibilityElementsHidden>
      {sources.map((source, i) => (
        <ReelFrame
          key={i}
          source={source}
          index={i}
          activeIndex={activeIndex}
          slideCount={sources.length}
        />
      ))}
      <Animated.View
        pointerEvents="none"
        style={[styles.filmVeil, veilStyle]}
      />
    </View>
  );
}

interface WelcomeProgressProps {
  count: number;
  activeIndex: number;
}

export function WelcomeFilmProgress({
  count,
  activeIndex,
}: WelcomeProgressProps) {
  return (
    <View style={styles.progressRow} accessibilityRole="tablist">
      {Array.from({ length: count }, (_, i) => (
        <ProgressSegment
          key={i}
          active={i === activeIndex}
          playing={i === activeIndex}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  filmVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },
  segmentTrack: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  segmentFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#ffffff",
  },
});
