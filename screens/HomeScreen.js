import React, { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Share } from "react-native";
import {
  Card,
  Text,
  Button,
  useTheme as usePaperTheme,
} from "react-native-paper";
import RecordRow from "../components/RecordRow";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getAvatarIllustration,
  getPainIllustration,
  resolveAvatarIllustrationKey,
  resolvePainIllustrationKey,
} from "../constants/illustrations";
import LoadStatusNotice from "../components/LoadStatusNotice";
import { SHARE_ACHIEVEMENT_ID } from "../utils/gamification";
import WeeklySummaryCard from "../components/WeeklySummaryCard";
import { buildWeeklyShareText } from "../utils/periodStats";
import { showMessage } from "../utils/confirm";
import { getCalmDayShareText, getHomeMessages } from "../utils/homeMessages";

const HomeScreen = () => {
  const {
    user,
    getTodayRecords,
    unlockAchievement,
    scheduleDeleteRecord,
    loadPeopleFromAPI,
    loadRecordsFromAPI,
    remoteStatus,
  } = useUser();
  const paperTheme = usePaperTheme();
  const navigation = useNavigation();
  const [dailyRecords, setDailyRecords] = useState([]);

  useEffect(() => {
    // Load data from API when screen opens
    loadPeopleFromAPI();
    loadRecordsFromAPI();
  }, [loadPeopleFromAPI, loadRecordsFromAPI]);

  const todayRecords = useMemo(() => getTodayRecords(), [getTodayRecords]);

  useFocusEffect(
    useCallback(() => {
      setDailyRecords(todayRecords);
    }, [todayRecords]),
  );

  const peopleById = useMemo(() => {
    const map = {};
    for (const p of user.people || []) {
      if (p?.id) map[p.id] = p;
    }
    return map;
  }, [user.people]);

  const painTypesById = useMemo(() => {
    const map = {};
    for (const painType of user.painTypes || []) {
      if (painType?.id) map[painType.id] = painType;
    }
    return map;
  }, [user.painTypes]);

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

  const resolveRecordIllustrationKey = useCallback(
    (record) => {
      const linkedPainType = record?.painTypeId
        ? painTypesById[record.painTypeId]
        : null;
  
      return resolvePainIllustrationKey({
        ...record,
        image: linkedPainType?.image || record?.image,
        name: linkedPainType?.name || record?.pain,
        pain: record?.pain,
      });
    },
    [painTypesById],
  );

  const heroIllustrationKey = useMemo(() => {
    if (todayRecords.length === 0) {
      return "Saltando.png";
    }

    return resolveRecordIllustrationKey(todayRecords[0]);
  }, [todayRecords, resolveRecordIllustrationKey]);

  const handleShareCalmDay = async () => {
    try {
      await Share.share({ message: getCalmDayShareText(new Date()) });
      unlockAchievement(SHARE_ACHIEVEMENT_ID);
    } catch {
      showMessage("No se pudo compartir", "Intenta de nuevo en un momento.");
    }
  };

  const handleShareWeek = async (week) => {
    try {
      await Share.share({ message: buildWeeklyShareText(week) });
      unlockAchievement(SHARE_ACHIEVEMENT_ID);
    } catch {
      showMessage("No se pudo compartir", "Intenta de nuevo en un momento.");
    }
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

      unlockAchievement(SHARE_ACHIEVEMENT_ID);
    } catch {
      Alert.alert("No se pudo compartir", "Intenta de nuevo en un momento.");
    }
  };

  const handleDeleteRecord = (record) => scheduleDeleteRecord(record);

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
  const home = getHomeMessages({
    todayRecords: dailyRecords,
    now: new Date(),
    name: user.profile?.name,
  });
  const {
    title: heroTitle,
    description: heroDescription,
    moodChip,
    forecastChip,
  } = home;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.people, hasData: (user.people || []).length > 0, label: "las personas", onRetry: loadPeopleFromAPI },
          { status: remoteStatus.records, hasData: (user.records || []).length > 0, label: "los registros", onRetry: loadRecordsFromAPI },
        ]}
      />
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
                {home.greeting}
              </Text>
              <Text
                variant="headlineSmall"
                accessibilityRole="header"
                style={styles.heroTitle}
              >
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

          {home.celebrate ? (
            <View style={styles.calmActions}>
              <Button
                mode="outlined"
                icon="share-variant-outline"
                onPress={handleShareCalmDay}
              >
                Compartir día tranquilo
              </Button>
              <Button
                mode="text"
                icon="plus"
                onPress={() => navigation.navigate("Registro")}
              >
                Anotar un dolor
              </Button>
            </View>
          ) : null}

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
              {home.note}
            </Text>
          </View>

          <Button
            mode="contained"
            icon="plus-circle-outline"
            onPress={() => navigation.getParent()?.navigate("Registro")}
            contentStyle={styles.primaryActionContent}
            style={styles.primaryAction}
          >
            {home.cta}
          </Button>

          {dailyRecords.length === 0 && (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: paperTheme.colors.surfaceVariant },
              ]}
            >
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {home.emptyTitle}
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {home.emptyText}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {(user.records || []).length > 0 ? (
        <WeeklySummaryCard
          records={user.records}
          onSeeStats={() => navigation.navigate("Más", { screen: "Insights" })}
          onShare={handleShareWeek}
        />
      ) : null}

      {dailyRecords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeading}>
              <Text
                variant="titleMedium"
                accessibilityRole="header"
                style={styles.sectionTitle}
              >
                {home.logTitle}
              </Text>
              <Text
                style={[
                  styles.sectionSubcopy,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {home.logSubtitle}
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
            const person = peopleById[personKey];
            const relationship = person?.relationship;
            return (
              <Card
                key={personKey}
                style={[
                  styles.personPanel,
                  { backgroundColor: paperTheme.colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.personHeader,
                    { backgroundColor: paperTheme.colors.primaryContainer },
                  ]}
                >
                  <IllustrationBadge
                    preset={getAvatarIllustration(
                      resolveAvatarIllustrationKey(person?.avatar),
                    )}
                    size={44}
                    avatar
                  />
                  <View style={styles.personCopy}>
                    <Text
                      variant="titleMedium"
                      numberOfLines={1}
                      style={[
                        styles.personTitle,
                        { color: paperTheme.colors.onPrimaryContainer },
                      ]}
                    >
                      {group.personName}
                    </Text>
                    {relationship ? (
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.personRelation,
                          { color: paperTheme.colors.onPrimaryContainer },
                        ]}
                      >
                        {relationship}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.personCount,
                      {
                        backgroundColor: paperTheme.colors.surface,
                        color: paperTheme.colors.onSurface,
                      },
                    ]}
                  >
                    {group.records.length} evento
                    {group.records.length === 1 ? "" : "s"}
                  </Text>
                </View>

                <View style={styles.recordsBlock}>
                  {group.records.map((record, index) => (
                    <View
                      key={record.id || index}
                      style={[
                        index > 0 && styles.recordItem,
                        { borderTopColor: paperTheme.colors.outlineVariant },
                      ]}
                    >
                      <RecordRow
                        record={record}
                        illustrationKey={resolveRecordIllustrationKey(record)}
                        subtitle={
                          record.createdAt ? formatTime(record.createdAt) : ""
                        }
                        onEdit={() =>
                          navigation.navigate("RecordPain", { record })
                        }
                        onShare={() => handleShareRecord(record)}
                        onDelete={() => handleDeleteRecord(record)}
                      />
                    </View>
                  ))}
                </View>
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
  sectionHeading: { flex: 1 },
  sectionTitle: { fontWeight: "700" },
  sectionSubcopy: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  sectionCount: {
    marginLeft: 12,
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
  calmActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
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
  personHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordsBlock: { paddingHorizontal: 16 },
  personCopy: { flex: 1, gap: 2 },
  personTitle: { fontWeight: "800" },
  personRelation: { fontSize: 13 },
  personCount: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  recordItem: { borderTopWidth: StyleSheet.hairlineWidth },
});

export default HomeScreen;
