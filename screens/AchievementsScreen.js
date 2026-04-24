import React from "react";
import { StyleSheet, FlatList } from "react-native";
import {
  Text,
  Card,
  List,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

const AchievementsScreen = () => {
  const { user } = useUser();
  const paperTheme = usePaperTheme();

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
          style={
            item.unlocked
              ? [styles.unlockedPoints, { color: paperTheme.colors.tertiary }]
              : [
                  styles.lockedPoints,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]
          }
        >
          {item.points} pts
        </Text>
      )}
      style={item.unlocked ? styles.unlockedItem : styles.lockedItem}
    />
  );

  return (
    <AppScreen>
      <HeroPanel
        compact
        eyebrow="VITRINA"
        title="Tus trofeos del caos controlado"
        description="Cada logro es una pequeña medalla por sobrevivir, registrar y mantener el humor en pie."
      />
      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
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
          />
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  unlockedItem: {
    backgroundColor: "transparent",
  },
  lockedItem: {
    backgroundColor: "transparent",
  },
  unlockedPoints: {
    fontWeight: "bold",
  },
  lockedPoints: {},
});

export default AchievementsScreen;
