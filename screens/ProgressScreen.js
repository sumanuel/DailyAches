import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  List,
  ProgressBar,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import {
  describeAchievementProgress,
  getAchievementProgress,
  getNextAchievement,
} from "../utils/gamification";

const ProgressScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, getLevelProgress, getLevelMeta } = useUser();

  const progress = getLevelProgress();
  const progress01 =
    typeof progress.progress === "number" ? progress.progress : 0;
  const currentLevel = getLevelMeta(user.level);
  const nextLevel = progress.nextLevel
    ? getLevelMeta(progress.nextLevel)
    : null;

  const progressState = useMemo(
    () => ({ recordsCount: user.recordsCount, points: user.points }),
    [user.recordsCount, user.points],
  );
  const nextAchievement = useMemo(
    () => getNextAchievement(user.achievements, progressState),
    [user.achievements, progressState],
  );
  const unlockedCount = user.achievements.filter((a) => a.unlocked).length;

  const renderAchievement = ({ item }) => (
    <List.Item
      title={item.name}
      description={() => {
        const progress = getAchievementProgress(item, progressState);
        return (
          <View>
            <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
              {item.description}
            </Text>
            {item.unlocked ? (
              <Text style={styles.achievementStatus}>Desbloqueado</Text>
            ) : (
              <View style={styles.achievementProgress}>
                <ProgressBar
                  progress={progress.ratio}
                  style={styles.achievementBar}
                />
                <Text style={styles.achievementStatus}>
                  {describeAchievementProgress(progress)}
                </Text>
              </View>
            )}
          </View>
        );
      }}
      left={(props) => (
        <List.Icon
          {...props}
          icon={item.icon || (item.unlocked ? "trophy" : "trophy-outline")}
          color={
            item.unlocked
              ? paperTheme.colors.tertiary
              : paperTheme.colors.onSurfaceVariant
          }
        />
      )}
      right={(props) => (
        <Text
          style={item.unlocked ? styles.unlockedPoints : styles.lockedPoints}
        >
          {item.points} pts
        </Text>
      )}
      style={item.unlocked ? styles.unlockedItem : styles.lockedItem}
    />
  );

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow="TU MARCADOR"
        title="Subes de nivel aunque el cuerpo proteste"
        description="Cada registro y cada logro suma. Aqui ves que tan lejos has llegado en tu carrera oficial de supervivencia con estilo."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Title title="Nivel y puntos" />
        <Card.Content>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: paperTheme.colors.primaryContainer },
            ]}
          >
            <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
            <View style={styles.levelCopy}>
              <Text style={styles.levelName}>{currentLevel.title}</Text>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
                Nivel {user.level}
              </Text>
            </View>
            <Text style={styles.levelPoints}>{user.points} pts</Text>
          </View>

          <View style={styles.row}>
            <Text variant="titleMedium">Progreso actual</Text>
            {nextLevel ? (
              <Text style={styles.nextLevelHint}>
                Siguiente: {nextLevel.icon} {nextLevel.title}
              </Text>
            ) : (
              <Text style={styles.nextLevelHint}>Rango máximo actual</Text>
            )}
          </View>
          <ProgressBar progress={progress01} style={styles.progress} />
          {progress.nextLevel ? (
            <Text style={styles.sub}>
              Faltan {progress.remaining} pts para nivel {progress.nextLevel}
            </Text>
          ) : (
            <Text style={styles.sub}>Nivel máximo alcanzado</Text>
          )}
        </Card.Content>
      </Card>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Title
          title="Logros"
          subtitle={`${unlockedCount} de ${user.achievements.length} desbloqueados`}
        />
        <Card.Content>
          {nextAchievement ? (
            <View
              style={[
                styles.nextAchievement,
                { backgroundColor: paperTheme.colors.secondaryContainer },
              ]}
            >
              <Text style={styles.nextAchievementLabel}>PRÓXIMO LOGRO</Text>
              <Text variant="titleMedium">{nextAchievement.achievement.name}</Text>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
                {nextAchievement.achievement.description}
              </Text>
              <ProgressBar
                progress={nextAchievement.progress.ratio}
                style={styles.progress}
              />
              <Text style={styles.sub}>
                {describeAchievementProgress(nextAchievement.progress)} · +
                {nextAchievement.achievement.points} pts
              </Text>
            </View>
          ) : null}
          <Text style={styles.subtitle}>
            Desbloquea hitos registrando dolores, sumando constancia y subiendo
            de rango.
          </Text>
          {user.achievements.length === 0 ? (
            <Text>No hay logros disponibles.</Text>
          ) : (
            user.achievements.map((item) => (
              <View key={item.id}>{renderAchievement({ item })}</View>
            ))
          )}
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  nextAchievement: { borderRadius: 20, padding: 14, marginBottom: 16, gap: 4 },
  nextAchievementLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  achievementProgress: { marginTop: 6, gap: 4 },
  achievementBar: { height: 6, borderRadius: 3 },
  achievementStatus: { fontSize: 12, marginTop: 2 },
  card: { marginBottom: 16, borderRadius: 24, overflow: "hidden" },
  levelBadge: {
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  levelIcon: { fontSize: 28 },
  levelCopy: { flex: 1 },
  levelName: { fontSize: 18, fontWeight: "800" },
  levelPoints: { fontSize: 18, fontWeight: "900" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextLevelHint: { fontSize: 12, opacity: 0.8 },
  progress: { marginTop: 12, height: 10, borderRadius: 6 },
  sub: { marginTop: 8, opacity: 0.7 },
  subtitle: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 20,
  },
  unlockedItem: { opacity: 1 },
  lockedItem: { opacity: 0.7 },
  unlockedPoints: { fontWeight: "bold" },
  lockedPoints: { opacity: 0.7 },
});

export default ProgressScreen;
