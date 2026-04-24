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
  const orbitColor = resolveColor(
    paperTheme,
    preset?.orbit,
    paperTheme.colors.primaryContainer,
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
          shadowColor: paperTheme.colors.onSurface,
          shadowOpacity: selected ? 0.18 : 0.08,
          shadowRadius: selected ? 16 : 10,
          shadowOffset: { width: 0, height: selected ? 8 : 4 },
          elevation: selected ? 6 : 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.ring,
          {
            borderRadius: radius,
            borderColor: selected
              ? paperTheme.colors.onPrimaryContainer
              : paperTheme.colors.surface,
            opacity: selected ? 0.35 : 0.18,
          },
        ]}
      />
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
      <View
        style={[
          styles.sheen,
          {
            width: size * 0.78,
            height: size * 0.3,
            borderRadius: size * 0.2,
            backgroundColor: paperTheme.colors.surface,
            opacity: selected ? 0.28 : 0.18,
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
      <View
        style={[
          styles.orbit,
          {
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: size * 0.09,
            backgroundColor: orbitColor,
            bottom: size * 0.12,
            left: size * 0.14,
          },
        ]}
      />
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
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
  halo: {
    position: "absolute",
    opacity: 0.78,
    transform: [{ translateY: 4 }],
  },
  sheen: {
    position: "absolute",
    top: 6,
    left: 8,
    transform: [{ rotate: "-10deg" }],
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
  orbit: {
    position: "absolute",
    opacity: 0.9,
  },
});

export default IllustrationBadge;
