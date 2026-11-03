import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import PersonAvatar from "./PersonAvatar";
import PressableScale from "./PressableScale";
import { useBurst } from "./BurstProvider";
import { MEDALS } from "../utils/peopleRanking";

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
  const fire = useBurst();

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
          <PersonAvatar avatar={person.avatar} size={52} style={styles.avatar} />
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
          <PressableScale
            onPress={(event) => fire("confetti", event)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={MEDALS[place].label}
          >
            <Text allowFontScaling={false} style={styles.medal}>
              {MEDALS[place].emoji}
            </Text>
          </PressableScale>
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
  body: { flex: 1, gap: 2 },
  medal: { fontSize: 24 },
  name: { fontWeight: "800" },
  detail: { fontSize: 13 },
});

export default PersonRow;
