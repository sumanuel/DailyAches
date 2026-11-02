import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import IllustrationBadge from "./IllustrationBadge";
import { getAvatarIllustration } from "../constants/illustrations";

// One look for every "nothing here yet" moment: an illustration, a short
// friendly message and, when there is something to do, a single action.
const EmptyState = ({
  illustration = "Zen.png",
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const paperTheme = usePaperTheme();

  return (
    <Animated.View entering={FadeInDown.duration(260)}>
    <Card
      style={[styles.card, { backgroundColor: paperTheme.colors.surface }, style]}
    >
      <Card.Content style={styles.content}>
        <IllustrationBadge
          preset={getAvatarIllustration(illustration)}
          size={72}
        />
        <Text
          variant="titleMedium"
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <View style={styles.action}>
            <Button mode="contained-tonal" onPress={onAction}>
              {actionLabel}
            </Button>
          </View>
        ) : null}
      </Card.Content>
    </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
  },
  description: {
    textAlign: "center",
    lineHeight: 20,
  },
  action: {
    marginTop: 8,
  },
});

export default EmptyState;
