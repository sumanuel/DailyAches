import React from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import {
  Text,
  Card,
  Provider as PaperProvider,
  List,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const AchievementsScreen = () => {
  const { user } = useUser();

  const renderAchievement = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.description}
      left={(props) => (
        <List.Icon
          {...props}
          icon={item.unlocked ? "trophy" : "trophy-outline"}
          color={item.unlocked ? "#FFD700" : "#ccc"}
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
    <Provider as PaperProvider>
      <ScrollView style={styles.container}>
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
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  unlockedItem: {
    backgroundColor: "#e8f5e8",
  },
  lockedItem: {
    backgroundColor: "#f5f5f5",
  },
  unlockedPoints: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  lockedPoints: {
    color: "#ccc",
  },
});

export default AchievementsScreen;
