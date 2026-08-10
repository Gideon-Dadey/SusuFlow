import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { authChrome } from "@/theme/auth-chrome";

const INK = authChrome.ink;
const ACCENT = "rgba(255,255,255,0.85)";
const MUTED = "rgba(255,255,255,0.18)";
const FAINT = "rgba(255,255,255,0.1)";

export function IdDocumentIllustration() {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.blob,
          styles.blobGray,
          { backgroundColor: isDark ? colors.muted : MUTED },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobPink,
          { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : FAINT },
        ]}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.card : "#111111",
            borderColor: isDark ? colors.border : INK,
          },
        ]}
      >
        <View style={[styles.cardPhoto, { backgroundColor: MUTED }]} />
        <View
          style={[
            styles.cardLineWide,
            { backgroundColor: isDark ? colors.mutedForeground : ACCENT },
          ]}
        />
        <View
          style={[
            styles.cardLine,
            { backgroundColor: isDark ? colors.muted : MUTED },
          ]}
        />
        <View
          style={[
            styles.cardLine,
            { backgroundColor: isDark ? colors.muted : MUTED },
          ]}
        />
        <View style={styles.cardSeal}>
          <View style={styles.cardSealInner} />
        </View>
      </View>
    </View>
  );
}

export function AddressIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.pinCircle}>
        <View style={styles.pinEye} />
      </View>
      <View style={styles.pinStem} />
      <View style={styles.pinTip} />
      <View style={[styles.accentSquare, { top: 28, right: 58 }]} />
    </View>
  );
}

export function CaptureIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.lensOuter}>
        <View style={styles.lensMid}>
          <View style={styles.lensCore} />
        </View>
      </View>
      <View style={[styles.lensLine, styles.lensLineA]} />
      <View style={[styles.lensLine, styles.lensLineB]} />
      <View style={[styles.accentSquare, { bottom: 34, left: 54 }]} />
    </View>
  );
}

export function EmergencyContactIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.overlap, styles.overlapNavy]} />
      <View style={[styles.overlap, styles.overlapGreen]} />
      <View style={[styles.lensLine, styles.contactLine]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 220,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobGray: {
    width: 88,
    height: 88,
    top: 18,
    left: 28,
  },
  blobPink: {
    width: 64,
    height: 64,
    bottom: 20,
    right: 30,
    borderRadius: 12,
  },
  card: {
    width: 168,
    height: 108,
    borderRadius: 14,
    borderWidth: 3,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardPhoto: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: INK,
  },
  cardLineWide: {
    width: 88,
    height: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  cardLine: {
    width: 72,
    height: 6,
    borderRadius: 3,
  },
  cardSeal: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardSealInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  pinCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  pinEye: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: INK,
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: INK,
    marginTop: -4,
  },
  pinTip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginTop: -2,
  },
  accentSquare: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  lensOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  lensMid: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  lensCore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: INK,
  },
  lensLine: {
    position: "absolute",
    width: 140,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 1,
  },
  lensLineA: {
    transform: [{ rotate: "35deg" }],
  },
  lensLineB: {
    transform: [{ rotate: "-35deg" }],
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  overlap: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  overlapNavy: {
    backgroundColor: INK,
    left: 34,
    top: 36,
  },
  overlapGreen: {
    backgroundColor: "rgba(255,255,255,0.85)",
    right: 34,
    top: 52,
  },
  contactLine: {
    width: 120,
    backgroundColor: INK,
    transform: [{ rotate: "20deg" }],
    top: 88,
  },
});
