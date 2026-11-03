import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import PressableScale from "./PressableScale";
import { useBurst } from "./BurstProvider";
import { categoryColor, intensityColor } from "../utils/chartColors";

// Small bar charts drawn with plain views: no chart library, and they follow
// the theme in light and dark mode. The bars grow when they appear (one after
// the other) and throw a little confetti in their color when tapped. Reanimated
// skips the growing when the system asks to reduce motion.

const GROW_MS = 700;

const describe = (items) =>
  items.map((item) => `${item.label ?? item.name} ${item.count}`).join(", ");

// 0 to 1, replayed whenever the bar's size changes.
const useGrow = (size, delay) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(0);
    progress.set(
      withDelay(delay, withTiming(1, { duration: GROW_MS, easing: Easing.out(Easing.cubic) })),
    );
  }, [size, delay, progress]);
  return progress;
};

const GrowingFill = ({ percent, delay, style }) => {
  const progress = useGrow(percent, delay);
  const animated = useAnimatedStyle(() => ({ width: `${percent * progress.value}%` }));
  return <Animated.View style={[style, animated]} />;
};

const GrowingBar = ({ size, delay, style }) => {
  const progress = useGrow(size, delay);
  const animated = useAnimatedStyle(() => ({ height: 3 + (size - 3) * progress.value }));
  return <Animated.View style={[style, animated]} />;
};

// Horizontal bars for a ranking (pain types, people), one color each.
export const BarList = ({ items, emptyLabel = "Sin datos" }) => {
  const paperTheme = usePaperTheme();
  const fire = useBurst();
  const max = Math.max(1, ...items.map((item) => item.count));

  if (items.length === 0) {
    return (
      <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
        {emptyLabel}
      </Text>
    );
  }

  return (
    <View style={styles.list} accessibilityLabel={describe(items)}>
      {items.map((item, index) => {
        const color = categoryColor(paperTheme.colors, index);
        return (
          <PressableScale
            key={item.key}
            pressedScale={0.98}
            accessible={false}
            onPress={(event) => fire("confetti", event, { colors: [color], count: 18 })}
            style={styles.listRow}
          >
            <View style={styles.listHeader}>
              <Text numberOfLines={1} style={styles.listName}>
                {item.name}
              </Text>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
                {item.count}
              </Text>
            </View>
            <View
              style={[
                styles.track,
                { backgroundColor: paperTheme.colors.outlineVariant },
              ]}
            >
              <GrowingFill
                percent={Math.max(4, (item.count / max) * 100)}
                delay={index * 90}
                style={[styles.fill, { backgroundColor: color }]}
              />
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
};

// Vertical bars over time, colored by how heavy the period was. `labelEvery` thins out the labels for long series.
export const ColumnChart = ({ data, height = 110, labelEvery = 1 }) => {
  const paperTheme = usePaperTheme();
  const fire = useBurst();
  const max = Math.max(1, ...data.map((item) => item.count));
  const dense = data.length > 14;

  return (
    <View
      accessibilityLabel={describe(data.filter((item) => item.count > 0))}
      style={styles.chart}
    >
      <View style={[styles.columns, { height }]}>
        {data.map((item, index) => {
          const color =
            item.count === 0
              ? paperTheme.colors.outline
              : intensityColor(paperTheme.colors, item.count / max);
          return (
            <PressableScale
              key={item.key}
              pressedScale={0.88}
              accessible={false}
              onPress={(event) => {
                if (item.count > 0) fire("confetti", event, { colors: [color], count: 14 });
              }}
              style={styles.column}
            >
              <GrowingBar
                size={item.count === 0 ? 3 : (item.count / max) * height}
                delay={index * 35}
                style={[
                  styles.bar,
                  dense && styles.barDense,
                  { backgroundColor: color },
                ]}
              />
            </PressableScale>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((item, index) => (
          <View key={item.key} style={styles.column}>
            {index % labelEvery === 0 ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.axisLabel,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {item.label}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: 12 },
  listRow: { gap: 6 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  listName: { flex: 1 },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: 10, borderRadius: 5 },
  chart: { gap: 6 },
  columns: { flexDirection: "row", alignItems: "flex-end" },
  labels: { flexDirection: "row" },
  column: { flex: 1, alignItems: "center", justifyContent: "flex-end", alignSelf: "stretch" },
  bar: { width: "62%", borderRadius: 6 },
  barDense: { width: "70%", borderRadius: 3 },
  axisLabel: { fontSize: 10, textAlign: "center" },
});
