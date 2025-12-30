import React, { useMemo, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import {
  DatePickerModal,
  es,
  registerTranslation,
} from "react-native-paper-dates";
import { useUser } from "../context/UserContext";

registerTranslation("es", es);

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
  const { user, getTodayRecords } = useUser();
  const { personId, personName } = route?.params || {};
  const [tab, setTab] = useState("today"); // today | history
  const [preset, setPreset] = useState("this_month"); // this_month | prev_month | this_week | custom
  const [historyRange, setHistoryRange] = useState(() =>
    getPresetRange("this_month")
  );
  const [rangeOpen, setRangeOpen] = useState(false);

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

  const renderRecord = (record, index) => {
    const person = record.personId ? peopleById.get(record.personId) : null;
    const relationship = person?.relationship || "Otro";

    return (
      <Card key={record.id || index} style={styles.recordCard}>
        <Card.Content style={styles.recordRowTop}>
          <Avatar.Icon
            size={40}
            icon="clipboard-text-outline"
            style={[
              styles.recordIcon,
              { backgroundColor: paperTheme.colors.surfaceVariant },
            ]}
            color={paperTheme.colors.onSurfaceVariant}
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
              {record.pain}
            </Text>
          </View>
        </Card.Content>

        <Card.Content style={styles.recordBottom}>
          <View style={styles.kv}>
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
          <View style={styles.kv}>
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
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text variant="titleMedium">Selecciona una persona</Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Vuelve atrás y elige a quién deseas ver el historial.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Icon
            size={44}
            icon="history"
            style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
            color={paperTheme.colors.onSurfaceVariant}
          />
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              {personName} ({count})
            </Text>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Historial de dolores para esta persona.
            </Text>
          </View>
        </Card.Content>
      </Card>

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
        <Card style={styles.filtersCard}>
          <Card.Content>
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
                  onPress={() => setRangeOpen(true)}
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
                  onPress={() => setRangeOpen(true)}
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
              >
                Este mes
              </Button>
              <Button
                mode={preset === "prev_month" ? "contained" : "outlined"}
                onPress={() => applyPreset("prev_month")}
              >
                Mes anterior
              </Button>
              <Button
                mode={preset === "this_week" ? "contained" : "outlined"}
                onPress={() => applyPreset("this_week")}
              >
                Esta semana
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <DatePickerModal
        locale="es"
        mode="range"
        visible={rangeOpen}
        startDate={historyRange.start}
        endDate={historyRange.end}
        onDismiss={() => setRangeOpen(false)}
        onConfirm={({ startDate, endDate }) => {
          if (startDate && endDate) {
            setHistoryRange({
              start: startOfDay(startDate),
              end: endOfDay(endDate),
            });
            setPreset("custom");
          }
          setRangeOpen(false);
        }}
        saveLabel="Aplicar"
      />

      {count === 0 ? (
        <Card style={styles.emptyCard}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  headerCard: { borderRadius: 16, overflow: "hidden" },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1 },
  headerTitle: { fontWeight: "800" },

  segment: {
    flexDirection: "row",
    gap: 8,
    padding: 6,
    borderRadius: 14,
    marginTop: 12,
  },
  segmentBtn: { flex: 1, borderRadius: 12 },
  segmentBtnContent: { height: 40 },

  filtersCard: { marginTop: 12, borderRadius: 16, overflow: "hidden" },
  rangeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  rangeCol: { flex: 1, gap: 6 },
  calendarBtn: { alignSelf: "stretch" },
  calendarBtnContent: { justifyContent: "flex-start", height: 40 },
  calendarBtnLabel: { fontSize: 12 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },

  recordsList: { marginTop: 12, gap: 10 },
  recordCard: { borderRadius: 16, overflow: "hidden" },
  recordRowTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  recordIcon: { borderRadius: 12 },
  recordMain: { flex: 1 },
  recordSub: { marginTop: 2 },
  pill: {
    maxWidth: 130,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  recordBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  kv: { flex: 1 },
  kvLabel: { fontSize: 10, letterSpacing: 0.6, fontWeight: "700" },

  emptyCard: { marginTop: 12, borderRadius: 16, overflow: "hidden" },
});

export default StatsScreen;
