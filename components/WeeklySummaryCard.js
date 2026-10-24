import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  IconButton,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import {
  describeAverageChange,
  describeCountChange,
  formatAverage,
  getWeeklyHighlights,
} from "../utils/periodStats";

// "Tu semana" on the home screen: this week against the previous one.
const WeeklySummaryCard = ({ records, onSeeStats, onShare }) => {
  const paperTheme = usePaperTheme();
  const { range, summary, comparison } = useMemo(
    () => getWeeklyHighlights(records),
    [records],
  );

  const facts = [
    { label: "Intensidad media", value: formatAverage(summary.averageLevel) },
    {
      label: "Días con dolor",
      value: `${summary.activeDays} de ${summary.totalDays}`,
    },
    { label: "Más frecuente", value: summary.topPain?.name || "–" },
  ];

  return (
    <Card
      style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text variant="titleMedium">Tu semana</Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              {range.label}
            </Text>
          </View>
          <IconButton
            icon="share-variant-outline"
            size={20}
            onPress={() => onShare?.(getWeeklyHighlights(records))}
            accessibilityLabel="Compartir resumen de la semana"
          />
        </View>

        <View style={styles.headline}>
          <Text variant="displaySmall" style={styles.count}>
            {summary.count}
          </Text>
          <View style={styles.headlineCopy}>
            <Text variant="titleSmall">
              {summary.count === 1 ? "registro" : "registros"} esta semana
            </Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              {describeCountChange(comparison)}
            </Text>
          </View>
        </View>

        {summary.count > 0 ? (
          <View style={styles.facts}>
            {facts.map((fact) => (
              <View
                key={fact.label}
                style={[
                  styles.fact,
                  { backgroundColor: paperTheme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.factLabel,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {fact.label}
                </Text>
                <Text numberOfLines={1} style={styles.factValue}>
                  {fact.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {describeAverageChange(comparison) ? (
          <Text
            style={[
              styles.note,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Intensidad media: {describeAverageChange(comparison)}
          </Text>
        ) : null}

        <Button mode="text" onPress={onSeeStats} style={styles.link}>
          Ver estadísticas
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, overflow: "hidden", marginTop: 12 },
  content: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerCopy: { flex: 1 },
  headline: { flexDirection: "row", alignItems: "center", gap: 14 },
  count: { fontWeight: "800" },
  headlineCopy: { flex: 1 },
  facts: { flexDirection: "row", gap: 8 },
  fact: { flex: 1, borderRadius: 16, padding: 10, gap: 2 },
  factLabel: { fontSize: 11, fontWeight: "700" },
  factValue: { fontWeight: "800" },
  note: { fontSize: 12 },
  link: { alignSelf: "flex-start" },
});

export default WeeklySummaryCard;
