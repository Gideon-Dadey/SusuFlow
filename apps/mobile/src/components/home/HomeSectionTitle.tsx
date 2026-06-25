import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

interface HomeSectionTitleProps {
  title: string;
  right?: ReactNode;
}

export function HomeSectionTitle({ title, right }: HomeSectionTitleProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 28,
  },
  title: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
});
