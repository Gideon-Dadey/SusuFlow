import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { HeaderArcDecoration } from "@/components/ui/HeaderArcDecoration";
import { useTheme } from "@/theme/ThemeProvider";

interface AuthScreenShellProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AuthScreenShell({ children, style }: AuthScreenShellProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <HeaderArcDecoration />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
});
