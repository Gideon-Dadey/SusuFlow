import { Linking, StyleSheet, Text, View } from "react-native";
import type { LegalDocument } from "@/content/legal";
import { bankChrome } from "@/theme/bankChrome";
import { spacing, typography } from "@/theme/tokens";

/** Fixed ink palette — legal docs stay readable on black regardless of theme. */
const ink = {
  page: bankChrome.pageDark,
  title: "#FFFFFF",
  body: "rgba(255,255,255,0.88)",
  meta: "rgba(255,255,255,0.55)",
  link: "#93C5FD",
  rule: "rgba(255,255,255,0.12)",
} as const;

interface LegalDocumentContentProps {
  document: LegalDocument;
}

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  return (
    <View style={[styles.root, { backgroundColor: ink.page }]}>
      <Text style={[styles.updated, { color: ink.meta }]}>
        Last updated: {document.updated}
      </Text>

      {document.sections.map((section, index) => (
        <View key={section.title} style={styles.section}>
          {index > 0 ? (
            <View style={[styles.rule, { backgroundColor: ink.rule }]} />
          ) : null}
          <Text style={[styles.heading, { color: ink.title }]}>
            {section.title}
          </Text>
          {section.paragraphs?.map((paragraph) => (
            <Text
              key={paragraph}
              style={[styles.paragraph, { color: ink.body }]}
            >
              {paragraph}
              {section.title === "7. Contact" ? (
                <Text
                  style={[styles.link, { color: ink.link }]}
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
              <Text style={[styles.bulletDot, { color: ink.meta }]}>•</Text>
              <Text style={[styles.bulletText, { color: ink.body }]}>
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
  root: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  updated: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    letterSpacing: 0.2,
  },
  section: {
    gap: spacing.md,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.lg,
    letterSpacing: -0.25,
    lineHeight: 26,
  },
  paragraph: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.base,
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  link: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.size.base,
    lineHeight: 28,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  bulletDot: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.base,
    lineHeight: 28,
  },
  bulletText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.base,
    lineHeight: 28,
    letterSpacing: 0.1,
  },
});
