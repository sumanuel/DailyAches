import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";

// Small bar charts drawn with plain views: no chart library, and they follow
// the theme in light and dark mode.

const describe = (items) =>
  items.map((item) => `${item.label ?? item.name} ${item.count}`).join(", ");

// Horizontal bars for a ranking (pain types, people).
export const BarList = ({ items, emptyLabel = "Sin datos" }) => {
  const paperTheme = usePaperTheme();
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
      {items.map((item) => (
        <View key={item.key} style={styles.listRow}>
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
              { backgroundColor: paperTheme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: paperTheme.colors.primary,
                  width: `${Math.max(4, (item.count / max) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// Vertical bars over time. `labelEvery` thins out the labels for long series.
export const ColumnChart = ({ data, height = 110, labelEvery = 1 }) => {
  const paperTheme = usePaperTheme();
  const max = Math.max(1, ...data.map((item) => item.count));
  const dense = data.length > 14;

  return (
    <View
      accessibilityLabel={describe(data.filter((item) => item.count > 0))}
      style={styles.chart}
    >
      <View style={[styles.columns, { height }]}>
        {data.map((item) => (
          <View key={item.key} style={styles.column}>
            <View
              style={[
                styles.bar,
                dense && styles.barDense,
                {
                  height: item.count === 0 ? 3 : (item.count / max) * height,
                  backgroundColor:
                    item.count === 0
                      ? paperTheme.colors.surfaceVariant
                      : paperTheme.colors.primary,
                },
              ]}
            />
          </View>
        ))}
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
  column: { flex: 1, alignItems: "center" },
  bar: { width: "62%", borderRadius: 6 },
  barDense: { width: "70%", borderRadius: 3 },
  axisLabel: { fontSize: 10, textAlign: "center" },
});
