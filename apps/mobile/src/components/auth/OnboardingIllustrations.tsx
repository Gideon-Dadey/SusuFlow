import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

const NAVY = "#1a365d";
import { brandGreen } from "@/theme/tokens";

const ACCENT = brandGreen;

export function IdDocumentIllustration() {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.blob,
          styles.blobGray,
          { backgroundColor: isDark ? colors.muted : "#f1f5f9" },
        ]}
      />
      <View
        style={[
          styles.blob,
          styles.blobPink,
          { backgroundColor: isDark ? "rgba(34,197,94,0.15)" : "#ffe4e6" },
        ]}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? colors.border : NAVY,
          },
        ]}
      >
        <View style={styles.cardPhoto} />
        <View
          style={[
            styles.cardLineWide,
            { backgroundColor: isDark ? colors.mutedForeground : "#cbd5e1" },
          ]}
        />
        <View
          style={[
            styles.cardLine,
            { backgroundColor: isDark ? colors.muted : "#f1f5f9" },
          ]}
        />
        <View
          style={[
            styles.cardLine,
            { backgroundColor: isDark ? colors.muted : "#f1f5f9" },
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
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardPhoto: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: NAVY,
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
    backgroundColor: ACCENT,
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
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  pinEye: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: NAVY,
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: NAVY,
    marginTop: -4,
  },
  pinTip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fbbf24",
    marginTop: -2,
  },
  accentSquare: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#fbbf24",
  },
  lensOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 8,
    borderColor: NAVY,
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
    backgroundColor: NAVY,
  },
  lensLine: {
    position: "absolute",
    width: 140,
    height: 2,
    backgroundColor: "#fbbf24",
    borderRadius: 1,
  },
  lensLineA: {
    transform: [{ rotate: "35deg" }],
  },
  lensLineB: {
    transform: [{ rotate: "-35deg" }],
    backgroundColor: ACCENT,
  },
  overlap: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  overlapNavy: {
    backgroundColor: NAVY,
    left: 34,
    top: 36,
  },
  overlapGreen: {
    backgroundColor: ACCENT,
    right: 34,
    top: 52,
  },
  contactLine: {
    width: 120,
    backgroundColor: NAVY,
    transform: [{ rotate: "20deg" }],
    top: 88,
  },
});
