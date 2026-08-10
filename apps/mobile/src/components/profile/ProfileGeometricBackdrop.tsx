import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface ProfileGeometricBackdropProps {
  height?: number;
  /** Dark navy geometry (GCB-style). Light mode uses softer charcoal. */
  isDark?: boolean;
}

/**
 * Full-bleed abstract triangle field used behind the profile hero —
 * matches the geometric header treatment in production banking apps.
 */
export function ProfileGeometricBackdrop({
  height = 220,
  isDark = true,
}: ProfileGeometricBackdropProps) {
  const base = isDark ? "#0B1220" : "#1E293B";
  const mid = isDark ? "#121A2B" : "#334155";
  const deep = isDark ? "#070B14" : "#0F172A";
  const edge = isDark ? "#1A2438" : "#475569";

  return (
    <View style={[styles.root, { height }]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 390 220"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="profileHeroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={base} stopOpacity="1" />
            <Stop offset="0.72" stopColor={deep} stopOpacity="1" />
            <Stop offset="1" stopColor={deep} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d="M0 0H390V220H0Z" fill="url(#profileHeroFade)" />
        <Path d="M0 0L160 0L0 140Z" fill={mid} opacity={0.9} />
        <Path d="M160 0L320 0L220 120L80 80Z" fill={edge} opacity={0.55} />
        <Path d="M250 0H390V90L300 40Z" fill={mid} opacity={0.75} />
        <Path d="M0 80L140 160L0 220Z" fill={edge} opacity={0.45} />
        <Path d="M120 100L260 70L310 180L150 200Z" fill={mid} opacity={0.35} />
        <Path d="M280 60L390 40V180L300 140Z" fill={edge} opacity={0.4} />
        <Path
          d="M40 40L120 20L90 100Z"
          fill="#243047"
          opacity={isDark ? 0.5 : 0.35}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
});
