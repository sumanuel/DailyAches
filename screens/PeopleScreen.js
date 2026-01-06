import React, { useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  FAB,
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

const PeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, addPerson, removePerson, updatePerson } = useUser();

  const [query, setQuery] = useState("");

  const openAdd = () => {
    navigation.navigate("AddPerson");
  };

  const openEdit = (person) => {
    navigation.navigate("AddPerson", { person });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return user.people;
    return user.people.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [query, user.people]);

  const onSelectPerson = (person) => {
    navigation.navigate("RecordPain", {
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
              <Text variant="bodyMedium" style={styles.muted}>
                Toca el botón + para agregar a quién le va a doler hoy.
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
                      Toca para registrar
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="pencil"
                    onPress={() => openEdit(p)}
                    accessibilityLabel="Editar persona"
                  />
                  <IconButton
                    icon="trash-can-outline"
                    onPress={() => removePerson(p.id)}
                    accessibilityLabel="Eliminar persona"
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      <FAB icon="plus" style={styles.fab} onPress={openAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  searchCard: { borderRadius: 16, overflow: "hidden" },
  searchContent: { paddingVertical: 6 },
  searchInput: { backgroundColor: "transparent" },
  list: { gap: 10, paddingBottom: 96, marginTop: 12 },
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
  muted: { opacity: 0.7, marginTop: 2 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  input: { marginBottom: 16 },
  relationshipButton: { marginTop: 8 },
  dialog: { borderRadius: 16 },
  dialogContent: { paddingVertical: 16 },
  avatarScroll: { marginBottom: 16 },
  avatarOption: { marginRight: 12, position: "relative" },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "white", fontSize: 24, fontWeight: "bold" },
  actions: { flexDirection: "row" },
});

export default PeopleScreen;
