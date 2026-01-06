import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const avatarImages = {
  "DolorDeCabeza.png": require("../assets/avatars/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/avatars/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/avatars/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/avatars/Mujer feliz.png"),
  "Saltando.png": require("../assets/avatars/Saltando.png"),
  "Alegre.png": require("../assets/avatars/Alegre.png"),
  "Mareo.png": require("../assets/avatars/Mareo.png"),
  "Trasnocho.png": require("../assets/avatars/Trasnocho.png"),
};

const HistoryPeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, loadPeopleFromAPI } = useUser();

  const [query, setQuery] = useState("");

  useEffect(() => {
    // Load people from API when screen opens
    loadPeopleFromAPI();
  }, []); // Remove loadPeopleFromAPI from dependencies

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return user.people || [];
    return (user.people || []).filter((p) =>
      (p.name || "").toLowerCase().includes(q)
    );
  }, [query, user.people]);

  const onSelectPerson = (person) => {
    navigation.navigate("HistoryDetail", {
      personId: person.id,
      personName: person.name,
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.searchCard}>
        <Card.Content style={styles.searchContent}>
          <TextInput
            mode="outlined"
            placeholder="Buscar persona..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="account-search" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Sin personas</Text>
              <Text
                style={{
                  color: paperTheme.colors.onSurfaceVariant,
                  marginTop: 4,
                }}
              >
                Agrega una persona en “Registro” para ver su historial.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card
              key={p.id}
              style={styles.card}
              onPress={() => onSelectPerson(p)}
            >
              <Card.Content style={styles.row}>
                <View style={styles.rowLeft}>
                  {p.avatar ? (
                    <Image
                      source={avatarImages[p.avatar]}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: paperTheme.colors.surfaceVariant },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {(p.name || "?").slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.meta}>
                    <Text variant="titleMedium" numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text
                      style={{
                        color: paperTheme.colors.onSurfaceVariant,
                        marginTop: 2,
                      }}
                    >
                      Toca para ver historial
                    </Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" />
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  searchCard: { borderRadius: 16, overflow: "hidden" },
  searchContent: { paddingVertical: 6 },
  searchInput: { backgroundColor: "transparent" },
  list: { gap: 10, paddingBottom: 24, marginTop: 12 },
  card: { width: "100%", borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  meta: { flex: 1 },
});

export default HistoryPeopleScreen;
