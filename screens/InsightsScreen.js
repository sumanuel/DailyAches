import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import LoadStatusNotice from "../components/LoadStatusNotice";
import { BarList, ColumnChart } from "../components/BarCharts";
import { filterRecords, getPainTypeOptions } from "../utils/recordFilters";
import {
  bucketByPeriod,
  compareSummaries,
  computeSummary,
  countByPerson,
  describeAverageChange,
  describeCountChange,
  formatAverage,
  getPeriodRange,
} from "../utils/periodStats";

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana", chartTitle: "Registros por día" },
  { value: "month", label: "Mes", chartTitle: "Registros por día" },
  { value: "year", label: "Año", chartTitle: "Registros por mes" },
];

const LABEL_EVERY = { week: 1, month: 5, year: 1 };
const TOP_ITEMS = 6;

const InsightsScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, loadRecordsFromAPI, remoteStatus } = useUser();
  const [period, setPeriod] = useState("month");
  const [offset, setOffset] = useState(0);
  const [personId, setPersonId] = useState(null);

  useEffect(() => {
    loadRecordsFromAPI();
  }, [loadRecordsFromAPI]);

  const changePeriod = (next) => {
    setPeriod(next);
    setOffset(0);
  };

  const range = useMemo(() => getPeriodRange(period, offset), [period, offset]);
  const previousRange = useMemo(
    () => getPeriodRange(period, offset - 1),
    [period, offset],
  );

  const scopedRecords = useMemo(
    () => filterRecords(user.records, { personId }),
    [user.records, personId],
  );
  const summary = useMemo(
    () => computeSummary(scopedRecords, range),
    [scopedRecords, range],
  );
  const previous = useMemo(
    () => computeSummary(scopedRecords, previousRange),
    [scopedRecords, previousRange],
  );
  const comparison = compareSummaries(summary, previous);

  const buckets = useMemo(
    () => bucketByPeriod(scopedRecords, period, range),
    [scopedRecords, period, range],
  );
  const painTypes = useMemo(
    () => getPainTypeOptions(summary.records).slice(0, TOP_ITEMS),
    [summary.records],
  );
  const people = useMemo(
    () => countByPerson(summary.records, user.people).slice(0, TOP_ITEMS),
    [summary.records, user.people],
  );

  const chartTitle = PERIOD_OPTIONS.find((o) => o.value === period).chartTitle;
  const tileColors = [
    paperTheme.colors.primaryContainer,
    paperTheme.colors.secondaryContainer,
    paperTheme.colors.accentMint,
    paperTheme.colors.accentSun,
  ];

  const tiles = [
    {
      key: "count",
      label: "Registros",
      value: String(summary.count),
      note: describeCountChange(comparison),
    },
    {
      key: "avg",
      label: "Intensidad media",
      value: formatAverage(summary.averageLevel),
      note: describeAverageChange(comparison),
    },
    {
      key: "days",
      label: "Días con dolor",
      value: `${summary.activeDays} de ${summary.totalDays}`,
      note: "",
    },
    {
      key: "top",
      label: "Más frecuente",
      value: summary.topPain ? summary.topPain.name : "–",
      note: summary.topPain ? `${summary.topPain.count} veces` : "",
    },
  ];

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow="ESTADÍSTICAS"
        title="Cómo van los achaques"
        description="Un resumen por semana, mes o año, comparado con el periodo anterior."
      />

      <View
        style={[
          styles.segment,
          { backgroundColor: paperTheme.colors.surfaceVariant },
        ]}
      >
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            mode={period === option.value ? "contained" : "text"}
            onPress={() => changePeriod(option.value)}
            style={styles.segmentButton}
          >
            {option.label}
          </Button>
        ))}
      </View>

      <View style={styles.navigator}>
        <IconButton
          icon="chevron-left"
          onPress={() => setOffset((current) => current - 1)}
          accessibilityLabel="Periodo anterior"
        />
        <Text variant="titleMedium" accessibilityRole="header">
          {range.label}
        </Text>
        <IconButton
          icon="chevron-right"
          disabled={offset === 0}
          onPress={() => setOffset((current) => Math.min(0, current + 1))}
          accessibilityLabel="Periodo siguiente"
        />
      </View>

      {(user.people || []).length > 1 ? (
        <View style={styles.chipRow}>
          <Chip selected={!personId} onPress={() => setPersonId(null)}>
            Todas
          </Chip>
          {user.people.map((person) => (
            <Chip
              key={person.id}
              selected={personId === person.id}
              onPress={() =>
                setPersonId(personId === person.id ? null : person.id)
              }
            >
              {person.name}
            </Chip>
          ))}
        </View>
      ) : null}

      <LoadStatusNotice
        sources={[
          {
            status: remoteStatus.records,
            hasData: (user.records || []).length > 0,
            label: "los registros",
            onRetry: loadRecordsFromAPI,
          },
        ]}
      />

      {summary.count === 0 ? (
        <Card
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleMedium">Sin registros en este periodo</Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              {comparison.hasPrevious
                ? "Hubo registros en el periodo anterior: usa la flecha para verlos."
                : "Cuando haya registros, aquí aparecerá su resumen."}
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          <View style={styles.tiles}>
            {tiles.map((tile, index) => (
              <View
                key={tile.key}
                style={[styles.tile, { backgroundColor: tileColors[index] }]}
              >
                <Text
                  style={[
                    styles.tileLabel,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  {tile.label}
                </Text>
                <Text
                  variant="headlineSmall"
                  numberOfLines={1}
                  style={styles.tileValue}
                >
                  {tile.value}
                </Text>
                {tile.note ? (
                  <Text
                    style={[
                      styles.tileNote,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {tile.note}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          <Card
            style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
          >
            <Card.Title title={chartTitle} />
            <Card.Content>
              <ColumnChart data={buckets} labelEvery={LABEL_EVERY[period]} />
            </Card.Content>
          </Card>

          <Card
            style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
          >
            <Card.Title title="Por tipo de dolor" />
            <Card.Content>
              <BarList items={painTypes} />
            </Card.Content>
          </Card>

          {!personId && people.length > 1 ? (
            <Card
              style={[
                styles.card,
                { backgroundColor: paperTheme.colors.surface },
              ]}
            >
              <Card.Title title="Por persona" />
              <Card.Content>
                <BarList items={people} />
              </Card.Content>
            </Card>
          ) : null}
        </>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 32, gap: 12 },
  segment: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segmentButton: { flex: 1 },
  navigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 20,
    padding: 14,
    gap: 4,
  },
  tileLabel: { fontSize: 12, fontWeight: "700" },
  tileValue: { fontWeight: "800" },
  tileNote: { fontSize: 12 },
  card: { borderRadius: 24, overflow: "hidden" },
});

export default InsightsScreen;
