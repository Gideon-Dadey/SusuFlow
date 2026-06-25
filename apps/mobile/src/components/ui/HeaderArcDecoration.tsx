import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export function HeaderArcDecoration() {
  const { colors, isDark } = useTheme();
  const stroke = isDark
    ? "rgba(255, 255, 255, 0.07)"
    : "rgba(15, 23, 42, 0.08)";

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.arc,
          styles.arcPrimary,
          { borderColor: stroke, backgroundColor: colors.background },
        ]}
      />
      <View
        style={[
          styles.arc,
          styles.arcSecondary,
          { borderColor: stroke, backgroundColor: colors.background },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  arc: {
    position: "absolute",
    borderWidth: 1,
  },
  arcPrimary: {
    width: 520,
    height: 520,
    borderRadius: 260,
    top: -430,
    alignSelf: "center",
    left: "50%",
    marginLeft: -260,
  },
  arcSecondary: {
    width: 640,
    height: 640,
    borderRadius: 320,
    top: -500,
    alignSelf: "center",
    left: "50%",
    marginLeft: -320,
    opacity: 0.65,
  },
});
