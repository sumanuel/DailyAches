import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";

const HeroPanel = ({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}) => {
  const paperTheme = usePaperTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: paperTheme.colors.surface,
        },
        compact && styles.compactCard,
      ]}
    >
      <Card.Content style={[styles.content, compact && styles.compactContent]}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: paperTheme.colors.primary }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text
          variant={compact ? "titleLarge" : "headlineSmall"}
          accessibilityRole="header"
          style={[styles.title, compact && styles.compactTitle]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              styles.description,
              compact && styles.compactDescription,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
        ) : null}
        {children ? <View style={styles.extra}>{children}</View> : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 14,
  },
  compactCard: {
    borderRadius: 22,
    marginBottom: 10,
  },
  compactContent: {
    gap: 2,
    paddingVertical: 6,
  },
  compactTitle: {
    lineHeight: 26,
  },
  compactDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontWeight: "900",
    lineHeight: 30,
  },
  description: {
    lineHeight: 20,
  },
  extra: {
    marginTop: 6,
  },
});

export default HeroPanel;
