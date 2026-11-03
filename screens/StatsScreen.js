import React, { useMemo, useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Modal } from "react-native";
import {
  Button,
  Card,
  Chip,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import HeroPanel from "../components/HeroPanel";
import RecordRow from "../components/RecordRow";
import { formatClock } from "../utils/timeFormat";
import { getRecordIllustrationKey } from "../constants/illustrations";
import LoadStatusNotice from "../components/LoadStatusNotice";
import AppTextField from "../components/AppTextField";
import {
  filterRecords,
  formatDayHeader,
  getPainTypeOptions,
  groupRecordsByDay,
} from "../utils/recordFilters";

const pad2 = (n) => String(n).padStart(2, "0");

// dd-mm-yyyy
const formatDate = (date) => {
  const d = new Date(date);
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfMonth = (date) => {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
};

const endOfMonth = (date) => {
  const d = startOfDay(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

// First to last day of the month: where the history opens.
const getMonthRange = (now = new Date()) => ({
  start: startOfMonth(now),
  end: endOfMonth(now),
});

const RECORDS_PAGE_SIZE = 30;

const StatsScreen = ({ route, navigation }) => {
  const paperTheme = usePaperTheme();
  const {
    user,
    getTodayRecords,
    loadRecordsFromAPI,
    remoteStatus,
    scheduleDeleteRecord,
  } = useUser();
  const { personId, personName } = route?.params || {};
  const [tab, setTab] = useState("today"); // today | history
  const [historyRange, setHistoryRange] = useState(() => getMonthRange());
  const [rangeOpen, setRangeOpen] = useState(false);
  // How many extra pages were revealed, and for which filters (a change of
  // filters starts again from the first page without needing an effect).
  const [page, setPage] = useState({ key: "", extra: 0 });
  const [painTypeChoice, setPainTypeChoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectingStart, setSelectingStart] = useState(true); // true for start, false for end
  const [tempRange, setTempRange] = useState(historyRange);

  useEffect(() => {
    loadRecordsFromAPI();
  }, [loadRecordsFromAPI]);

  const painTypesById = useMemo(() => {
    const map = {};
    for (const painType of user.painTypes || []) {
      if (painType?.id) map[painType.id] = painType;
    }
    return map;
  }, [user.painTypes]);

  const todayRecords = useMemo(() => {
    const allToday = getTodayRecords();
    if (!personId) return [];
    return allToday.filter((r) => r.personId === personId);
  }, [getTodayRecords, personId]);

  // Pain types the person has in the chosen range, for the filter chips.
  const rangeRecords = useMemo(
    () =>
      filterRecords(user.records, {
        personId,
        start: historyRange.start,
        end: historyRange.end,
      }),
    [historyRange.end, historyRange.start, personId, user.records],
  );
  const painTypeOptions = useMemo(
    () => getPainTypeOptions(rangeRecords),
    [rangeRecords],
  );

  // A pain type that disappears with the range can no longer stay selected.
  const painTypeKey = painTypeOptions.some((o) => o.key === painTypeChoice)
    ? painTypeChoice
    : null;

  const historyRecords = useMemo(
    () =>
      filterRecords(rangeRecords, { painTypeKey, query: searchQuery }),
    [rangeRecords, painTypeKey, searchQuery],
  );
  const hasActiveFilters = Boolean(painTypeKey) || searchQuery.trim() !== "";

  const clearFilters = () => {
    setPainTypeChoice(null);
    setSearchQuery("");
  };

  const records = tab === "today" ? todayRecords : historyRecords;
  const count = records.length;

  const pageKey = [
    tab,
    historyRange.start.getTime(),
    historyRange.end.getTime(),
    personId,
    painTypeKey,
    searchQuery,
  ].join("|");
  const visibleCount =
    RECORDS_PAGE_SIZE + (page.key === pageKey ? page.extra : 0);

  const getMarkedDates = () => {
    const marked = {};
    const start = rangeOpen ? tempRange.start : historyRange.start;
    const end = rangeOpen ? tempRange.end : historyRange.end;
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    marked[startStr] = {
      startingDay: true,
      color: paperTheme.colors.primary,
      textColor: "white",
    };
    marked[endStr] = {
      endingDay: true,
      color: paperTheme.colors.primary,
      textColor: "white",
    };
    if (startStr !== endStr) {
      let current = new Date(start);
      current.setDate(current.getDate() + 1);
      while (current < end) {
        const dateStr = current.toISOString().split("T")[0];
        marked[dateStr] = {
          color: paperTheme.colors.primary,
          textColor: "white",
        };
        current.setDate(current.getDate() + 1);
      }
    }
    return marked;
  };

  const renderRecord = (record, index) => (
    <View
      key={record.id || index}
      style={[
        index > 0 && styles.recordDivider,
        { borderTopColor: paperTheme.colors.outlineVariant },
      ]}
    >
      <RecordRow
        record={record}
        illustrationKey={getRecordIllustrationKey(record, painTypesById)}
        subtitle={formatClock(record.createdAt)}
        onEdit={() => navigation.navigate("RecordPain", { record })}
        onDelete={() => scheduleDeleteRecord(record)}
      />
    </View>
  );

  // One card per list of records, rows separated by a thin line.
  const renderRecordCard = (list) => (
    <Card
      style={[styles.recordCard, { backgroundColor: paperTheme.colors.surface }]}
    >
      <Card.Content style={styles.recordCardContent}>
        {list.map(renderRecord)}
      </Card.Content>
    </Card>
  );

  if (!personId || !personName) {
    return (
      <AppScreen contentContainerStyle={styles.content}>
        <HeroPanel
          compact
          eyebrow="SIN PERSONA"
          title="Primero elige a quien vas a investigar"
          description="Vuelve atras, selecciona una persona y aqui veras su historial ordenado por fechas y episodios."
        />
        <EmptyState
          illustration="Zen.png"
          title="Selecciona una persona"
          description="Vuelve atrás y elige a quién deseas ver el historial."
          style={styles.emptyCard}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        compact
        eyebrow="HISTORIAL DETALLADO"
        title={`${personName} en cifras y episodios`}
      />

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.records, hasData: (user.records || []).length > 0, label: "los registros", onRetry: loadRecordsFromAPI },
        ]}
      />

      <View
        style={[
          styles.segment,
          { backgroundColor: paperTheme.colors.surfaceVariant },
        ]}
      >
        <Button
          mode={tab === "today" ? "contained" : "text"}
          onPress={() => setTab("today")}
          style={styles.segmentBtn}
          contentStyle={styles.segmentBtnContent}
        >
          Hoy
        </Button>
        <Button
          mode={tab === "history" ? "contained" : "text"}
          onPress={() => setTab("history")}
          style={styles.segmentBtn}
          contentStyle={styles.segmentBtnContent}
        >
          Histórico
        </Button>
      </View>

      {tab === "history" && (
        <Card
          style={[
            styles.filtersCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
        >
          <Card.Content>
            <View style={styles.rangeRow}>
              <View style={styles.rangeCol}>
                <Button
                  mode="outlined"
                  icon="calendar"
                  onPress={() => {
                    setSelectingStart(true);
                    setTempRange(historyRange);
                    setRangeOpen(true);
                  }}
                  style={styles.calendarBtn}
                  contentStyle={styles.calendarBtnContent}
                  labelStyle={styles.calendarBtnLabel}
                >
                  {formatDate(historyRange.start)}
                </Button>
              </View>
              <View style={styles.rangeCol}>
                <Button
                  mode="outlined"
                  icon="calendar"
                  onPress={() => {
                    setSelectingStart(false);
                    setTempRange(historyRange);
                    setRangeOpen(true);
                  }}
                  style={styles.calendarBtn}
                  contentStyle={styles.calendarBtnContent}
                  labelStyle={styles.calendarBtnLabel}
                >
                  {formatDate(historyRange.end)}
                </Button>
              </View>
            </View>

            <AppTextField
              label="Buscar en notas"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ej. migraña, trabajo"
              style={styles.searchInput}
            />

            {painTypeOptions.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                <Chip
                  selected={!painTypeKey}
                  onPress={() => setPainTypeChoice(null)}
                  style={styles.filterChip}
                >
                  Todos
                </Chip>
                {painTypeOptions.map((option) => (
                  <Chip
                    key={option.key}
                    selected={painTypeKey === option.key}
                    onPress={() =>
                      setPainTypeChoice(
                        painTypeKey === option.key ? null : option.key,
                      )
                    }
                    style={styles.filterChip}
                  >
                    {option.name} ({option.count})
                  </Chip>
                ))}
              </ScrollView>
            ) : null}
          </Card.Content>
        </Card>
      )}

      <Modal
        visible={rangeOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRangeOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: paperTheme.colors.background },
            ]}
          >
            <Text variant="titleMedium" style={styles.modalTitle}>
              Seleccionar {selectingStart ? "fecha de inicio" : "fecha de fin"}
            </Text>
            <Calendar
              current={
                selectingStart
                  ? tempRange.start.toISOString().split("T")[0]
                  : tempRange.end.toISOString().split("T")[0]
              }
              markedDates={getMarkedDates()}
              onDayPress={(day) => {
                const selectedDate = new Date(day.dateString);
                if (selectingStart) {
                  setTempRange((prev) => ({
                    ...prev,
                    start: startOfDay(selectedDate),
                    end:
                      prev.end < selectedDate
                        ? endOfDay(selectedDate)
                        : prev.end,
                  }));
                } else {
                  setTempRange((prev) => ({
                    ...prev,
                    end: endOfDay(selectedDate),
                    start:
                      prev.start > selectedDate
                        ? startOfDay(selectedDate)
                        : prev.start,
                  }));
                }
              }}
              theme={{
                backgroundColor: paperTheme.colors.background,
                calendarBackground: paperTheme.colors.surface,
                textSectionTitleColor: paperTheme.colors.onSurface,
                selectedDayBackgroundColor: paperTheme.colors.primary,
                selectedDayTextColor: paperTheme.colors.onPrimary,
                todayTextColor: paperTheme.colors.primary,
                dayTextColor: paperTheme.colors.onSurface,
                textDisabledColor: paperTheme.colors.onSurfaceDisabled,
                dotColor: paperTheme.colors.primary,
                selectedDotColor: paperTheme.colors.onPrimary,
                arrowColor: paperTheme.colors.primary,
                monthTextColor: paperTheme.colors.onSurface,
                indicatorColor: paperTheme.colors.primary,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
            <View style={styles.modalButtons}>
              <Button onPress={() => setRangeOpen(false)}>Cancelar</Button>
              <Button
                mode="contained"
                onPress={() => {
                  setHistoryRange(tempRange);
                  setRangeOpen(false);
                }}
              >
                Aplicar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {count === 0 ? (
        <EmptyState
          illustration={hasActiveFilters ? "Mareo.png" : "Zen.png"}
          title={
            tab === "today"
              ? "Sin registros hoy"
              : hasActiveFilters
                ? "Sin registros con estos filtros"
                : "Sin registros en este rango"
          }
          description={
            tab === "history" && hasActiveFilters
              ? "Prueba con otra búsqueda o quita los filtros."
              : "Ve a “Registro” para agregar un dolor."
          }
          actionLabel={
            tab === "history" && hasActiveFilters ? "Limpiar filtros" : undefined
          }
          onAction={clearFilters}
          style={styles.emptyCard}
        />
      ) : (
        <View style={styles.recordsList}>
          {tab === "history"
            ? groupRecordsByDay(records.slice(0, visibleCount)).map((group) => (
                <View key={group.key}>
                  <Text
                    style={[
                      styles.dayHeader,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                    accessibilityRole="header"
                  >
                    {formatDayHeader(group.date)} · {group.records.length}
                  </Text>
                  {renderRecordCard(group.records)}
                </View>
              ))
            : renderRecordCard(records.slice(0, visibleCount))}
          {count > visibleCount ? (
            <Button
              mode="text"
              onPress={() =>
                setPage({
                  key: pageKey,
                  extra: visibleCount, // the next page adds RECORDS_PAGE_SIZE more
                })
              }
            >
              Ver más registros ({count - visibleCount} restantes)
            </Button>
          ) : null}
        </View>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  searchInput: { marginTop: 10 },
  chipRow: { flexDirection: "row", gap: 8, paddingTop: 10, paddingRight: 4 },
  filterChip: { borderRadius: 16 },
  dayHeader: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
    padding: 6,
    borderRadius: 14,
    marginTop: 8,
  },
  segmentBtn: { flex: 1, borderRadius: 12 },
  segmentBtnContent: { minHeight: 40 },

  filtersCard: { marginTop: 8, borderRadius: 22, overflow: "hidden" },
  rangeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  rangeCol: { flex: 1, gap: 6 },
  calendarBtn: { alignSelf: "stretch", borderRadius: 999 },
  calendarBtnContent: { minHeight: 44 },
  calendarBtnLabel: { fontSize: 12 },

  recordsList: { marginTop: 12, gap: 12 },
  recordCard: { borderRadius: 24, overflow: "hidden" },
  recordCardContent: { paddingVertical: 0 },
  recordDivider: { borderTopWidth: StyleSheet.hairlineWidth },

  emptyCard: { marginTop: 12, borderRadius: 24, overflow: "hidden" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: { width: "90%", borderRadius: 16, padding: 16 },
  modalTitle: { textAlign: "center", marginBottom: 16 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default StatsScreen;
