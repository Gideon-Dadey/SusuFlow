import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const base = isDark ? colors.muted : colors.border;

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius,
          backgroundColor: base,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.txnRow}>
          <SkeletonCircle size={34} />
          <View style={styles.txnCopy}>
            <Skeleton width="72%" height={14} />
            <Skeleton width="48%" height={11} />
          </View>
          <View style={styles.txnRight}>
            <Skeleton width={64} height={14} />
            <Skeleton width={52} height={18} borderRadius={radius.full} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ActivitySummarySkeleton() {
  return (
    <View style={styles.overviewCard}>
      <Skeleton width={64} height={10} />
      <Skeleton width="48%" height={32} borderRadius={radius.md} />
      <Skeleton height={StyleSheet.hairlineWidth} />
      <View style={styles.overviewMetrics}>
        <View style={styles.summaryCell}>
          <Skeleton width={56} height={10} />
          <Skeleton width={72} height={16} />
        </View>
        <View style={styles.summaryCell}>
          <Skeleton width={56} height={10} />
          <Skeleton width={72} height={16} />
        </View>
      </View>
    </View>
  );
}

export function ActivityScreenSkeleton() {
  return (
    <View style={styles.activityScreen}>
      <Skeleton height={40} borderRadius={radius.lg} />
      <ActivitySummarySkeleton />
      <Skeleton height={40} borderRadius={radius.lg} />
      <Skeleton height={88} borderRadius={radius.lg} />
      <View style={styles.activityGroup}>
        <Skeleton width={120} height={12} />
        <Skeleton height={44} borderRadius={radius.lg} />
        <Skeleton height={220} borderRadius={radius.lg} />
      </View>
    </View>
  );
}

export function PlanEnrollmentSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.planRow}>
          <Skeleton width="65%" height={14} />
          <Skeleton width="40%" height={11} />
          <Skeleton height={6} borderRadius={radius.full} />
        </View>
      ))}
    </View>
  );
}

export function ProfileRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.profileRow}>
          <Skeleton width={34} height={34} borderRadius={radius.lg} />
          <View style={styles.txnCopy}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="70%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function HomeBalanceSkeleton() {
  return (
    <View style={styles.balanceCard}>
      <Skeleton width={96} height={12} />
      <Skeleton width="58%" height={36} borderRadius={radius.md} />
      <Skeleton width={48} height={10} />
      <Skeleton height={44} borderRadius={radius.md} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: "hidden",
  },
  list: {
    gap: 4,
    paddingVertical: 8,
  },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  txnCopy: {
    flex: 1,
    gap: 8,
  },
  txnRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  summaryCell: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  overviewCard: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
  },
  overviewMetrics: {
    flexDirection: "row",
    gap: 16,
  },
  activityScreen: {
    gap: 16,
  },
  activityGroup: {
    gap: 8,
  },
  planRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  balanceCard: {
    gap: 12,
    padding: 20,
    borderRadius: radius.lg,
  },
});
