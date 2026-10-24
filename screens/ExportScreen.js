import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import LoadStatusNotice from "../components/LoadStatusNotice";
import FieldError from "../components/FieldError";
import { filterRecords, describeRecordCount } from "../utils/recordFilters";
import { EXPORT_PERIODS, getExportRange } from "../utils/exportRecords";
import { exportRecords, isPdfSupported } from "../utils/exportService";

const ExportScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, loadRecordsFromAPI, remoteStatus } = useUser();
  const [personId, setPersonId] = useState(null);
  const [periodKey, setPeriodKey] = useState("month");
  const [format, setFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState(null); // { ok, text }

  useEffect(() => {
    loadRecordsFromAPI();
  }, [loadRecordsFromAPI]);

  const range = useMemo(() => getExportRange(periodKey), [periodKey]);
  const person = (user.people || []).find((p) => p.id === personId) || null;
  const personLabel = person ? person.name : "Todas las personas";

  const selected = useMemo(
    () =>
      filterRecords(user.records, {
        personId,
        start: range.start,
        end: range.end,
      }),
    [user.records, personId, range],
  );

  const pdfAvailable = isPdfSupported();

  const onExport = async () => {
    setStatus(null);
    setExporting(true);
    const result = await exportRecords({
      format,
      records: selected,
      people: user.people,
      personLabel: person ? person.name : "",
      rangeLabel: range.label,
    });
    setExporting(false);
    setStatus(
      result.success
        ? { ok: true, text: `Listo: ${result.fileName}` }
        : { ok: false, text: result.error },
    );
  };

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        compact
        eyebrow="EXPORTAR"
        title="Lleva tu historial contigo"
        description="Crea un archivo con los registros para abrirlo en una hoja de cálculo o mostrarlo en una consulta."
      />

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

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">Persona</Text>
          <View style={styles.chipRow}>
            <Chip selected={!personId} onPress={() => setPersonId(null)}>
              Todas
            </Chip>
            {(user.people || []).map((p) => (
              <Chip
                key={p.id}
                selected={personId === p.id}
                onPress={() => setPersonId(p.id)}
              >
                {p.name}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium">Periodo</Text>
          <View style={styles.chipRow}>
            {EXPORT_PERIODS.map((period) => (
              <Chip
                key={period.key}
                selected={periodKey === period.key}
                onPress={() => setPeriodKey(period.key)}
              >
                {period.label}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium">Formato</Text>
          <View style={styles.chipRow}>
            <Chip selected={format === "csv"} onPress={() => setFormat("csv")}>
              CSV (hoja de cálculo)
            </Chip>
            <Chip
              selected={format === "pdf"}
              disabled={!pdfAvailable}
              onPress={() => setFormat("pdf")}
            >
              PDF (para imprimir)
            </Chip>
          </View>
          {!pdfAvailable ? (
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              El PDF solo está disponible en la app del móvil.
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content style={styles.section}>
          <Text variant="titleMedium">
            {describeRecordCount(selected.length)} para exportar
          </Text>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
            {personLabel} · {range.label}
          </Text>
          <Button
            mode="contained"
            icon="export-variant"
            onPress={onExport}
            loading={exporting}
            disabled={exporting || selected.length === 0}
            style={styles.button}
          >
            {pdfAvailable ? "Exportar y compartir" : "Descargar"}
          </Button>
          {selected.length === 0 ? (
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              No hay registros con esta selección. Prueba con otro periodo.
            </Text>
          ) : null}
          {status?.ok ? (
            <Text
              style={{ color: paperTheme.colors.primary }}
              accessibilityLiveRegion="polite"
            >
              {status.text}
            </Text>
          ) : (
            <FieldError message={status?.text} />
          )}
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 24, overflow: "hidden" },
  section: { gap: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: { borderRadius: 16 },
});

export default ExportScreen;
