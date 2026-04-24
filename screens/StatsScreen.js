import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Modal } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";

const monthShortEs = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const pad2 = (n) => String(n).padStart(2, "0");

const formatDateEs = (date) => {
  const d = new Date(date);
  return `${pad2(d.getDate())} ${
    monthShortEs[d.getMonth()]
  } ${d.getFullYear()}`;
};

const formatTimeEs = (date) => {
  const d = new Date(date);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
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

const startOfWeekMonday = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  // JS: 0=Dom ... 6=Sáb. Queremos lunes como inicio.
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
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

const getPrevMonthRange = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 1);
  return { start: startOfMonth(d), end: endOfMonth(d) };
};

const getPresetRange = (preset, now = new Date()) => {
  if (preset === "this_week") {
    const start = startOfWeekMonday(now);
    const end = endOfDay(now);
    return { start, end };
  }
  if (preset === "prev_month") {
    return getPrevMonthRange(now);
  }
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return { start, end };
};

const StatsScreen = ({ route }) => {
  const paperTheme = usePaperTheme();
  const { user, getTodayRecords, loadRecordsFromAPI } = useUser();
  const { personId, personName } = route?.params || {};
  const [tab, setTab] = useState("today"); // today | history
  const [preset, setPreset] = useState("this_month"); // this_month | prev_month | this_week | custom
  const [historyRange, setHistoryRange] = useState(() =>
    getPresetRange("this_month"),
  );
  const [rangeOpen, setRangeOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true); // true for start, false for end
  const [tempRange, setTempRange] = useState(historyRange);

  useEffect(() => {
    loadRecordsFromAPI();
  }, []);

  const applyPreset = (p) => {
    setPreset(p);
    setHistoryRange(getPresetRange(p));
  };

  const peopleById = useMemo(() => {
    const map = new Map();
    for (const p of user.people || []) map.set(p.id, p);
    return map;
  }, [user.people]);

  const todayRecords = useMemo(() => {
    const allToday = getTodayRecords();
    if (!personId) return [];
    return allToday.filter((r) => r.personId === personId);
  }, [getTodayRecords, personId, user.records]);

  const historyRecords = useMemo(() => {
    const start = historyRange.start.getTime();
    const end = historyRange.end.getTime();
    if (!personId) return [];
    return (user.records || [])
      .filter((r) => {
        if (r.personId !== personId) return false;
        const t = new Date(r.createdAt).getTime();
        return t >= start && t <= end;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [historyRange.end, historyRange.start, personId, user.records]);

  const records = tab === "today" ? todayRecords : historyRecords;
  const count = records.length;

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

  const renderRecord = (record, index) => {
    const person = record.personId ? peopleById.get(record.personId) : null;
    const relationship = person?.relationship || "Otro";

    return (
      <Card
        key={record.id || index}
        style={[
          styles.recordCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content style={styles.recordRowTop}>
          <IllustrationBadge
            preset={getPainIllustration(resolvePainIllustrationKey(record))}
            size={54}
            style={styles.recordIcon}
          />

          <View style={styles.recordMain}>
            <Text variant="titleMedium" numberOfLines={1}>
              {record.personName}
            </Text>
            <Text
              style={[
                styles.recordSub,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {formatDateEs(record.createdAt)} ·{" "}
              {formatTimeEs(record.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.pill,
              { backgroundColor: paperTheme.colors.primaryContainer },
            ]}
          >
            <Text
              style={{
                color: paperTheme.colors.onPrimaryContainer,
                fontWeight: "700",
              }}
              numberOfLines={1}
            >
              😣 {record.pain}
            </Text>
          </View>
        </Card.Content>

        <Card.Content style={styles.recordBottom}>
          <View
            style={[
              styles.kv,
              { backgroundColor: paperTheme.colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.kvLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              PARENTEZCO
            </Text>
            <Text numberOfLines={1}>{relationship}</Text>
          </View>
          <View
            style={[
              styles.kv,
              { backgroundColor: paperTheme.colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.kvLabel,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              NOTAS
            </Text>
            <Text numberOfLines={1}>{record.notes ? record.notes : "-"}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!personId || !personName) {
    return (
      <AppScreen contentContainerStyle={styles.content}>
        <HeroPanel
          compact
          eyebrow="SIN PERSONA"
          title="Primero elige a quien vas a investigar"
          description="Vuelve atras, selecciona una persona y aqui veras su historial ordenado por fechas y episodios."
        />
        <Card
          style={[
            styles.emptyCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text variant="titleMedium">Selecciona una persona</Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Vuelve atrás y elige a quién deseas ver el historial.
            </Text>
          </Card.Content>
        </Card>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow="HISTORIAL DETALLADO"
        title={`${personName} en cifras y episodios`}
        description="Alterna entre el resumen de hoy y el archivo historico para leer el comportamiento del dolor sin perder contexto."
      >
        <Text
          style={[
            styles.heroChip,
            {
              backgroundColor: paperTheme.colors.accentSun,
              color: paperTheme.colors.onSurface,
            },
          ]}
        >
          Registros: {count}
        </Text>
      </HeroPanel>

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
            <View style={styles.filtersHeader}>
              <Text variant="titleMedium" style={styles.filtersTitle}>
                Rango del historial
              </Text>
              <Text
                style={[
                  styles.filtersSubtitle,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Elige fechas rápidas o define un rango manual.
              </Text>
            </View>

            <View style={styles.rangeRow}>
              <View style={styles.rangeCol}>
                <Text
                  style={[
                    styles.kvLabel,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  DESDE
                </Text>
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
                  {formatDateEs(historyRange.start)}
                </Button>
              </View>
              <View style={styles.rangeCol}>
                <Text
                  style={[
                    styles.kvLabel,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  HASTA
                </Text>
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
                  {formatDateEs(historyRange.end)}
                </Button>
              </View>
            </View>

            <View style={styles.quickRow}>
              <Button
                mode={preset === "this_month" ? "contained" : "outlined"}
                onPress={() => applyPreset("this_month")}
                style={styles.quickBtn}
                contentStyle={styles.quickBtnContent}
                labelStyle={styles.quickBtnLabel}
                compact={true}
              >
                Este mes
              </Button>
              <Button
                mode={preset === "prev_month" ? "contained" : "outlined"}
                onPress={() => applyPreset("prev_month")}
                style={styles.quickBtn}
                contentStyle={styles.quickBtnContent}
                labelStyle={styles.quickBtnLabel}
                compact={true}
              >
                Mes anterior
              </Button>
              <Button
                mode={preset === "this_week" ? "contained" : "outlined"}
                onPress={() => applyPreset("this_week")}
                style={styles.quickBtn}
                contentStyle={styles.quickBtnContent}
                labelStyle={styles.quickBtnLabel}
                compact={true}
              >
                Esta semana
              </Button>
            </View>
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
                  setPreset("custom");
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
        <Card
          style={[
            styles.emptyCard,
            { backgroundColor: paperTheme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text variant="titleMedium">
              {tab === "today"
                ? "Sin registros hoy"
                : "Sin registros en este rango"}
            </Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Ve a “Registro” para agregar un dolor.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.recordsList}>{records.map(renderRecord)}</View>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  heroChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },

  segment: {
    flexDirection: "row",
    gap: 8,
    padding: 6,
    borderRadius: 14,
    marginTop: 12,
  },
  segmentBtn: { flex: 1, borderRadius: 12 },
  segmentBtnContent: { height: 40 },

  filtersCard: { marginTop: 12, borderRadius: 24, overflow: "hidden" },
  filtersHeader: { marginBottom: 14 },
  filtersTitle: { fontWeight: "800" },
  filtersSubtitle: { marginTop: 4, lineHeight: 18 },
  rangeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  rangeCol: { flex: 1, gap: 6 },
  calendarBtn: { alignSelf: "stretch", borderRadius: 999 },
  calendarBtnContent: { justifyContent: "flex-start", height: 44 },
  calendarBtnLabel: { fontSize: 12 },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  quickBtn: {
    borderRadius: 999,
  },
  quickBtnContent: { height: 38, paddingHorizontal: 6 },
  quickBtnLabel: { fontSize: 12 },

  recordsList: { marginTop: 12, gap: 12 },
  recordCard: { borderRadius: 24, overflow: "hidden" },
  recordRowTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  recordIcon: { borderRadius: 16 },
  recordMain: { flex: 1 },
  recordSub: { marginTop: 2 },
  pill: {
    maxWidth: 132,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  recordBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  kv: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
  },
  kvLabel: { fontSize: 10, letterSpacing: 0.6, fontWeight: "700" },

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
