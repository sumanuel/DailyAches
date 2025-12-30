import React from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import {
  Card,
  List,
  ProgressBar,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const ProgressScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, getLevelProgress } = useUser();

  const progress = getLevelProgress();
  const progress01 =
    typeof progress.progress === "number" ? progress.progress : 0;

  const renderAchievement = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.description}
      left={(props) => (
        <List.Icon
          {...props}
          icon={item.unlocked ? "trophy" : "trophy-outline"}
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
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={styles.title}>
        Mi Progreso
      </Text>

      {/* Level Section */}
      <Card style={styles.card}>
        <Card.Title title="Nivel y puntos" />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleMedium">Nivel {user.level}</Text>
            <Text variant="titleMedium">{user.points} pts</Text>
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

      {/* Achievements Section */}
      <Card style={styles.card}>
        <Card.Title title="Logros" />
        <Card.Content>
          <Text style={styles.subtitle}>
            Desbloquea logros registrando dolores y alcanzando hitos.
          </Text>
          <FlatList
            data={user.achievements}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAchievement}
            ListEmptyComponent={<Text>No hay logros disponibles.</Text>}
            scrollEnabled={false}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  title: { marginBottom: 12 },
  card: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progress: { marginTop: 12, height: 10, borderRadius: 6 },
  sub: { marginTop: 8, opacity: 0.7 },
  subtitle: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  unlockedItem: { opacity: 1 },
  lockedItem: { opacity: 0.7 },
  unlockedPoints: { fontWeight: "bold" },
  lockedPoints: { opacity: 0.7 },
});

export default ProgressScreen;
