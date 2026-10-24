import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import { PAIN_LEVELS, getPainLevelLabel } from "../utils/painLevel";

// Pick an intensity from 1 to 10. Large circles keep comfortable tap targets.
const PainLevelPicker = ({ value, onChange, style }) => {
  const paperTheme = usePaperTheme();

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
            <Pressable
              key={level}
              onPress={() => onChange(level)}
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
            </Pressable>
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
    gap: 8,
  },
  option: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PainLevelPicker;
