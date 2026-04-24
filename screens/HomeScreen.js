import React, { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Share } from "react-native";
import {
  Card,
  Text,
  IconButton,
  Button,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getAvatarIllustration,
  getPainIllustration,
  resolveAvatarIllustrationKey,
  resolvePainIllustrationKey,
} from "../constants/illustrations";

const HomeScreen = () => {
  const {
    user,
    getTodayRecords,
    unlockAchievement,
    deleteRecord,
    loadPeopleFromAPI,
    loadRecordsFromAPI,
  } = useUser();
  const paperTheme = usePaperTheme();
  const navigation = useNavigation();
  const [dailyRecords, setDailyRecords] = useState([]);
  const [message, setMessage] = useState("");

  const defaultMessages = [
    "Hoy ya puede revisarse como va el panorama de achaques.",
    "Los dolores registrados aqui siguen sumando puntos y logros.",
    "Un dia sin dolor tambien merece quedar anotado.",
    "Si aparece un achaque nuevo, desde aqui se registra rapido.",
  ];

  const surpriseMessages = [
    "Todavia no aparece ningun dolor registrado hoy.",
    "Por ahora el dia va en calma y sin achaques reportados.",
  ];

  useEffect(() => {
    // Load data from API when screen opens
    loadPeopleFromAPI();
    loadRecordsFromAPI();
  }, []); // Remove loadPeopleFromAPI and loadRecordsFromAPI from dependencies

  const todayRecords = useMemo(() => getTodayRecords(), [user.records]);

  // Memoizar el mensaje para evitar cambios constantes
  const currentMessage = useMemo(() => {
    if (todayRecords.length === 0) {
      return surpriseMessages[0]; // Usar mensaje fijo en lugar de aleatorio
    } else {
      return defaultMessages[0]; // Usar mensaje fijo en lugar de aleatorio
    }
  }, [todayRecords.length]);

  const heroIllustrationKey = useMemo(() => {
    if (todayRecords.length === 0) {
      return "Saltando.png";
    }

    return resolvePainIllustrationKey(todayRecords[0]);
  }, [todayRecords.length]);

  useFocusEffect(
    useCallback(() => {
      setDailyRecords(todayRecords);
      setMessage(currentMessage);
    }, [todayRecords, currentMessage]),
  );

  const peopleById = useMemo(() => {
    const map = {};
    for (const p of user.people || []) {
      if (p?.id) map[p.id] = p;
    }
    return map;
  }, [user.people]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes} ${ampm}`;
  };

  const handleShareRecord = async (record) => {
    try {
      const shareLines = [
        `Registro de dolor de ${record.personName || "persona"}`,
        `Dolor: ${record.pain}`,
      ];

      if (record.notes) {
        shareLines.push(`Notas: ${record.notes}`);
      }

      if (record.createdAt) {
        shareLines.push(`Hora: ${formatTime(record.createdAt)}`);
      }

      await Share.share({
        message: shareLines.join("\n"),
      });

      unlockAchievement(5);
    } catch (error) {
      Alert.alert("No se pudo compartir", "Intenta de nuevo en un momento.");
    }
  };

  const handleDeleteRecord = (record) => {
    Alert.alert(
      "Eliminar registro",
      `¿Estás seguro de que quieres eliminar el registro de dolor "${record.pain}" para ${record.personName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteRecord(record.id);
            // El estado se actualizará automáticamente a través del useMemo
          },
        },
      ],
    );
  };

  const groupedByPerson = useMemo(() => {
    return Object.entries(
      dailyRecords.reduce((acc, record) => {
        const key = record.personId || record.personName || "(Sin persona)";
        if (!acc[key])
          acc[key] = { personName: record.personName, records: [] };
        acc[key].records.push(record);
        return acc;
      }, {}),
    );
  }, [dailyRecords]);

  const todayCount = dailyRecords.length;
  const totalPeople = user.people?.length || 0;
  const heroTitle =
    todayCount === 0 ? "Hoy manda la paz" : "Radar del drama corporal";
  const heroDescription =
    todayCount === 0
      ? "Todavia no hay achaques fichados. Si todo sigue en calma, este tablero queda listo para cuando toque registrar alguno."
      : "Aqui se resume quien presento molestias, que dolio y a que hora comenzo el episodio del dia.";
  const moodChip = todayCount === 0 ? "Dia en calma" : "Hoy hubo registro";
  const forecastChip =
    todayCount === 0
      ? "Pronostico: sin novedad"
      : "Pronostico: seguimiento y cuidado";

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >
      <Card
        style={[
          styles.heroCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content>
          <View
            style={[
              styles.heroGlow,
              { backgroundColor: paperTheme.colors.heroBackdrop },
            ]}
          />
          <View
            style={[
              styles.heroBubbleTop,
              { backgroundColor: paperTheme.colors.accentSun },
            ]}
          />
          <View
            style={[
              styles.heroBubbleBottom,
              { backgroundColor: paperTheme.colors.accentMint },
            ]}
          />
          <View style={styles.heroPillsRow}>
            <Text
              style={[
                styles.heroPill,
                {
                  backgroundColor: paperTheme.colors.primaryContainer,
                  color: paperTheme.colors.onPrimaryContainer,
                },
              ]}
            >
              {moodChip}
            </Text>
            <Text
              style={[
                styles.heroPill,
                {
                  backgroundColor: paperTheme.colors.accentBerry,
                  color: paperTheme.colors.onSurface,
                },
              ]}
            >
              {forecastChip}
            </Text>
          </View>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text
                style={[styles.eyebrow, { color: paperTheme.colors.primary }]}
              >
                DAILYACHES, PERO CON PERSONALIDAD
              </Text>
              <Text variant="headlineSmall" style={styles.heroTitle}>
                {heroTitle}
              </Text>
              <Text
                style={[
                  styles.heroText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {heroDescription}
              </Text>
            </View>
            <IllustrationBadge
              preset={
                todayCount === 0
                  ? getAvatarIllustration(heroIllustrationKey)
                  : getPainIllustration(heroIllustrationKey)
              }
              size={132}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.statTile,
                { backgroundColor: paperTheme.colors.primaryContainer },
              ]}
            >
              <Text style={styles.statEmoji}>🩹</Text>
              <Text style={styles.statValue}>{todayCount}</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Registros hoy
              </Text>
            </View>
            <View
              style={[
                styles.statTile,
                { backgroundColor: paperTheme.colors.secondaryContainer },
              ]}
            >
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statValue}>{user.points}</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Puntos
              </Text>
            </View>
            <View
              style={[
                styles.statTile,
                { backgroundColor: paperTheme.colors.accentMint },
              ]}
            >
              <Text style={styles.statEmoji}>🫶</Text>
              <Text style={styles.statValue}>{totalPeople}</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Personas
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text
              style={[
                styles.levelBadge,
                {
                  backgroundColor: paperTheme.colors.accentSky,
                  color: paperTheme.colors.onSurface,
                },
              ]}
            >
              Nivel {user.level}
            </Text>
            <Text
              style={[
                styles.summaryMessage,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              {message}
            </Text>
          </View>

          <Button
            mode="contained"
            icon="plus-circle-outline"
            onPress={() => navigation.getParent()?.navigate("Registro")}
            contentStyle={styles.primaryActionContent}
            style={styles.primaryAction}
          >
            Ir a Registro
          </Button>

          {dailyRecords.length === 0 && (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: paperTheme.colors.surfaceVariant },
              ]}
            >
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Cero registros, cero caos
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Cuando aparezca el primer dolor, este espacio se convierte en tu
                tablero de seguimiento con un poco menos de drama y bastante más
                claridad.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {dailyRecords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Bitácora del día
              </Text>
              <Text
                style={[
                  styles.sectionSubcopy,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Primero aparece la persona y luego cada achaque registrado.
              </Text>
            </View>
            <Text
              style={[
                styles.sectionCount,
                {
                  backgroundColor: paperTheme.colors.accentSun,
                  color: paperTheme.colors.onSurface,
                },
              ]}
            >
              {todayCount} registro{todayCount === 1 ? "" : "s"}
            </Text>
          </View>
          {groupedByPerson.map(([personKey, group]) => {
            const relationship = peopleById[personKey]?.relationship;
            return (
              <Card
                key={personKey}
                style={[
                  styles.personPanel,
                  { backgroundColor: paperTheme.colors.surface },
                ]}
              >
                <Card.Content style={styles.personPanelContent}>
                  <View style={styles.personHeader}>
                    <View style={styles.personIdentity}>
                      <IllustrationBadge
                        preset={getAvatarIllustration(
                          resolveAvatarIllustrationKey(
                            peopleById[personKey]?.avatar,
                          ),
                        )}
                        size={56}
                      />
                      <View style={styles.personCopy}>
                        <Text variant="titleLarge" style={styles.personTitle}>
                          {group.personName}
                        </Text>
                        {relationship ? (
                          <Text
                            style={[
                              styles.personRelation,
                              {
                                color: paperTheme.colors.onSurfaceVariant,
                              },
                            ]}
                          >
                            {relationship}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.personCount,
                        {
                          backgroundColor: paperTheme.colors.primaryContainer,
                          color: paperTheme.colors.onPrimaryContainer,
                        },
                      ]}
                    >
                      {group.records.length} evento
                      {group.records.length === 1 ? "" : "s"}
                    </Text>
                  </View>

                  <View style={styles.recordList}>
                    {group.records.map((record, index) => {
                      const timeLabel = record.createdAt
                        ? formatTime(record.createdAt)
                        : "";

                      return (
                        <View
                          key={record.id || index}
                          style={[
                            styles.recordRow,
                            !record.notes && styles.recordRowCompact,
                            {
                              backgroundColor: paperTheme.colors.surfaceVariant,
                            },
                          ]}
                        >
                          <View style={styles.recordTopRow}>
                            <IllustrationBadge
                              preset={getPainIllustration(
                                resolvePainIllustrationKey(record),
                              )}
                              size={54}
                              style={styles.recordImage}
                            />

                            <View style={styles.recordBody}>
                              <View style={styles.recordHeadingRow}>
                                <Text
                                  variant="titleMedium"
                                  style={styles.painTitle}
                                >
                                  {record.pain}
                                </Text>
                                {timeLabel ? (
                                  <Text
                                    style={[
                                      styles.timePill,
                                      {
                                        backgroundColor:
                                          paperTheme.colors.accentSky,
                                        color: paperTheme.colors.onSurface,
                                      },
                                    ]}
                                  >
                                    {timeLabel}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          </View>

                          {record.notes ? (
                            <View style={styles.recordMetaRow}>
                              <Text
                                numberOfLines={2}
                                style={[
                                  styles.recordMetaText,
                                  {
                                    color: paperTheme.colors.onSurfaceVariant,
                                  },
                                ]}
                              >
                                {record.notes}
                              </Text>
                            </View>
                          ) : null}

                          <View style={styles.painActions}>
                            <IconButton
                              icon="square-edit-outline"
                              size={18}
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: paperTheme.colors.surface,
                                },
                              ]}
                              onPress={() =>
                                navigation.navigate("RecordPain", { record })
                              }
                              accessibilityLabel="Editar registro"
                            />
                            <IconButton
                              icon="delete-circle-outline"
                              size={18}
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: paperTheme.colors.surface,
                                },
                              ]}
                              onPress={() => handleDeleteRecord(record)}
                              accessibilityLabel="Eliminar registro"
                            />
                            <IconButton
                              icon="share-variant-outline"
                              size={18}
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: paperTheme.colors.surface,
                                },
                              ]}
                              onPress={() => handleShareRecord(record)}
                              accessibilityLabel="Compartir registro"
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  section: { marginTop: 6 },
  heroGlow: {
    position: "absolute",
    top: -42,
    right: -30,
    width: 170,
    height: 170,
    borderRadius: 999,
    opacity: 0.9,
  },
  heroBubbleTop: {
    position: "absolute",
    top: 54,
    right: 88,
    width: 28,
    height: 28,
    borderRadius: 999,
    opacity: 0.8,
  },
  heroBubbleBottom: {
    position: "absolute",
    bottom: 24,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 999,
    opacity: 0.8,
  },
  heroPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  heroPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontWeight: "700" },
  sectionSubcopy: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  sectionCount: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: { fontWeight: "900", lineHeight: 30 },
  heroText: { lineHeight: 21, maxWidth: 250 },
  heroImage: { width: 132, height: 132 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statEmoji: { fontSize: 18, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { marginTop: 4, fontSize: 12, fontWeight: "600" },
  summaryRow: { marginTop: 16, gap: 10 },
  levelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryMessage: { lineHeight: 20 },
  primaryAction: { marginTop: 16, borderRadius: 16 },
  primaryActionContent: { minHeight: 48 },
  emptyState: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  emptyTitle: { fontWeight: "700" },
  emptyText: { lineHeight: 20 },
  personPanel: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
  },
  personPanelContent: {
    paddingTop: 18,
    paddingBottom: 18,
  },
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  personIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  personCopy: {
    flex: 1,
    gap: 2,
  },
  personTitle: { fontWeight: "800", fontSize: 18 },
  personRelation: { fontSize: 13, fontWeight: "800" },
  personCount: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  recordList: { marginTop: 14, gap: 10 },
  recordRow: {
    borderRadius: 22,
    padding: 14,
    gap: 12,
  },
  recordRowCompact: {
    gap: 8,
  },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recordImage: { flexShrink: 0 },
  recordBody: {
    flex: 1,
    justifyContent: "center",
  },
  recordHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  painTitle: { flex: 1, fontWeight: "800" },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  recordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
  },
  recordMetaText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  painActions: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  actionButton: {
    margin: 0,
  },
});

export default HomeScreen;
