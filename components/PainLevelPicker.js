import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import PressableScale from "./PressableScale";
import { useBurst } from "./BurstProvider";
import {
  PAIN_LEVELS,
  getPainLevelEmojis,
  getPainLevelLabel,
} from "../utils/painLevel";

// Pick an intensity from 1 to 10. Large circles keep comfortable tap targets.
const PainLevelPicker = ({ value, onChange, style }) => {
  const paperTheme = usePaperTheme();
  const fire = useBurst();

  return (
    <View style={style}>
      <View style={styles.header}>
        <Text variant="titleSmall">Intensidad</Text>
        <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
          {value} de 10 · {getPainLevelLabel(value)}
        </Text>
      </View>
      <View style={styles.row}>
        {PAIN_LEVELS.map((level) => {
          const selected = level === value;
          return (
            <PressableScale
              key={level}
              pop={selected}
              onPress={(event) => {
                onChange(level);
                fire("emoji", event, { emojis: getPainLevelEmojis(level), count: 7 });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Intensidad ${level} de 10`}
              accessibilityState={{ selected }}
              style={[
                styles.option,
                {
                  backgroundColor: selected
                    ? paperTheme.colors.primary
                    : paperTheme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: selected
                    ? paperTheme.colors.onPrimary
                    : paperTheme.colors.onSurface,
                }}
              >
                {level}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    // Five buttons per row (5 x 44 + 4 x 8), centered on the card.
    alignSelf: "center",
    maxWidth: 252,
  },
  option: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 4,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PainLevelPicker;
