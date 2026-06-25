import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CardSurface } from "@/components/ui/CardSurface";
import { useTheme } from "@/theme/ThemeProvider";

export function Card({
  title,
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { colors, typography } = useTheme();

  return (
    <CardSurface innerStyle={styles.card}>
      {title ? (
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: typography.fontFamily.semibold,
                fontSize: typography.size.base,
                color: colors.foreground,
              },
            ]}
          >
            {title}
          </Text>
          {action}
        </View>
      ) : null}
      {children}
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {},
});
