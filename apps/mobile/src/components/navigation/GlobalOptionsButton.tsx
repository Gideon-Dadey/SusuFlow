import { StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OptionsMenuButton } from "@/components/navigation/OptionsMenuButton";
import { useUiStore } from "@/stores/ui.store";
import { spacing } from "@/theme/tokens";

export function GlobalOptionsButton() {
  const insets = useSafeAreaInsets();
  const openOptions = useUiStore((s) => s.openOptions);
  const pathname = usePathname();
  const isHome =
    pathname === "/" || pathname === "/(tabs)" || pathname.endsWith("/index");

  if (isHome) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, styles.layer]}
    >
      <View
        style={[
          styles.anchor,
          {
            top: insets.top + spacing.sm,
            right: spacing.lg,
          },
        ]}
      >
        <OptionsMenuButton onPress={openOptions} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 20,
  },
  anchor: {
    position: "absolute",
  },
});
