import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";

const resolveColor = (theme, token, fallback) => {
  if (!token) return fallback;
  return theme.colors[token] || token || fallback;
};

const IllustrationBadge = ({
  preset,
  size = 56,
  selected = false,
  rounded = true,
  style,
}) => {
  const paperTheme = usePaperTheme();
  const radius = rounded ? size / 2 : Math.round(size * 0.34);
  const backgroundColor = resolveColor(
    paperTheme,
    preset?.tone,
    paperTheme.colors.surfaceVariant,
  );
  const haloColor = resolveColor(
    paperTheme,
    preset?.halo,
    paperTheme.colors.surface,
  );

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
          borderColor: selected
            ? paperTheme.colors.primary
            : paperTheme.colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.halo,
          {
            width: size * 0.68,
            height: size * 0.68,
            borderRadius: rounded ? size * 0.34 : Math.round(size * 0.22),
            backgroundColor: haloColor,
          },
        ]}
      />
      <Text style={[styles.glyph, { fontSize: size * 0.42 }]}>
        {preset?.glyph || "✨"}
      </Text>
      {preset?.spark ? (
        <View
          style={[
            styles.sparkWrap,
            {
              borderRadius: Math.round(size * 0.18),
              backgroundColor: paperTheme.colors.surface,
              minWidth: size * 0.32,
              minHeight: size * 0.32,
            },
          ]}
        >
          <Text style={[styles.spark, { fontSize: size * 0.14 }]}>
            {preset.spark}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  halo: {
    position: "absolute",
    opacity: 0.78,
    transform: [{ translateY: 4 }],
  },
  glyph: {
    textAlign: "center",
  },
  sparkWrap: {
    position: "absolute",
    top: 4,
    right: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  spark: {
    fontWeight: "800",
    lineHeight: 12,
  },
});

export default IllustrationBadge;
