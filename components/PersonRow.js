import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import IllustrationBadge from "./IllustrationBadge";
import PressableScale from "./PressableScale";
import { MEDALS } from "../utils/peopleRanking";
import {
  getAvatarIllustration,
  resolveAvatarIllustrationKey,
} from "../constants/illustrations";

// A person as a tappable card: avatar, name, and one line of detail. `right` is
// whatever goes at the end (an actions menu, an arrow) and `place` (1 to 3)
// puts a medal before it.
const PersonRow = ({
  person,
  detail,
  onPress,
  right,
  place,
  accessibilityLabel,
}) => {
  const paperTheme = usePaperTheme();

  return (
    <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
      <Card.Content style={styles.content}>
        {/* The tappable area is its own element: `right` may hold buttons, and
            a button cannot sit inside another one (invalid on web). */}
        <PressableScale
          style={styles.main}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || person.name}
        >
          {person.avatar ? (
            <IllustrationBadge
              preset={getAvatarIllustration(
                resolveAvatarIllustrationKey(person.avatar),
              )}
              size={52}
              avatar
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.initial,
                {
                  backgroundColor: paperTheme.colors.surfaceVariant,
                  borderColor: paperTheme.colors.avatarBorder,
                },
              ]}
            >
              <Text style={styles.initialText}>
                {(person.name || "?").slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.body}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
              {person.name}
            </Text>
            {detail ? (
              <Text
                numberOfLines={1}
                style={[styles.detail, { color: paperTheme.colors.onSurfaceVariant }]}
              >
                {detail}
              </Text>
            ) : null}
          </View>
        </PressableScale>
        {MEDALS[place] ? (
          <Text
            accessibilityLabel={MEDALS[place].label}
            allowFontScaling={false}
            style={styles.medal}
          >
            {MEDALS[place].emoji}
          </Text>
        ) : null}
        {right}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", marginBottom: 12 },
  content: { flexDirection: "row", alignItems: "center", gap: 4 },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { flexShrink: 0 },
  initial: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: { fontSize: 18, fontWeight: "700" },
  body: { flex: 1, gap: 2 },
  medal: { fontSize: 24 },
  name: { fontWeight: "800" },
  detail: { fontSize: 13 },
});

export default PersonRow;
