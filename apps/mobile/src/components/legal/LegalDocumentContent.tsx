import { Linking, StyleSheet, Text, View } from "react-native";
import type { LegalDocument } from "@/content/legal";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

interface LegalDocumentContentProps {
  document: LegalDocument;
}

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.updated, { color: colors.mutedForeground }]}>
        Last updated: {document.updated}
      </Text>

      {document.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            {section.title}
          </Text>
          {section.paragraphs?.map((paragraph) => (
            <Text
              key={paragraph}
              style={[styles.paragraph, { color: colors.mutedForeground }]}
            >
              {paragraph}
              {section.title === "7. Contact" ? (
                <Text
                  style={[styles.link, { color: colors.primary }]}
                  onPress={() =>
                    void Linking.openURL(`mailto:${document.contactEmail}`)
                  }
                >
                  {" "}
                  {document.contactEmail}
                </Text>
              ) : null}
            </Text>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: colors.primary }]}>
                •
              </Text>
              <Text
                style={[styles.bulletText, { color: colors.mutedForeground }]}
              >
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  updated: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  section: {
    gap: spacing.sm,
  },
  heading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
    letterSpacing: -0.1,
  },
  paragraph: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  link: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bulletDot: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
});
