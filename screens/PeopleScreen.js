import React, { useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  FAB,
  Portal,
  Dialog,
  Button,
  useTheme as usePaperTheme,
  Menu,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const avatarImages = {
  "DolorDeCabeza.png": require("../assets/avatars/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/avatars/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/avatars/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/avatars/Mujer feliz.png"),
  "Saltando.png": require("../assets/avatars/Saltando.png"),
};

const PeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, addPerson, removePerson } = useUser();

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("Mujer feliz.png");
  const [menuVisible, setMenuVisible] = useState(false);

  const avatars = [
    "DolorDeCabeza.png",
    "DolorDeEspalda.png",
    "DolorDePiernas.png",
    "Mujer feliz.png",
    "Saltando.png",
  ];

  const relationshipOptions = [
    "Esposa",
    "Novia",
    "Madre",
    "Hermana",
    "Prima",
    "Amiga",
    "Otro",
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return user.people;
    return user.people.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [query, user.people]);

  const openAdd = () => {
    setNewName("");
    setNewRelationship("");
    setSelectedAvatar("Mujer feliz.png");
    setAddOpen(true);
  };

  const onConfirmAdd = () => {
    addPerson(newName, newRelationship, selectedAvatar);
    setAddOpen(false);
  };

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
                      {p.relationship} Toca para registrar dolor
                    </Text>
                  </View>
                </View>
                <IconButton
                  icon="trash-can-outline"
                  onPress={() => removePerson(p.id)}
                  accessibilityLabel="Eliminar persona"
                />
              </Card.Content>
            </Card>
          ))
        )}
      </View>

      <FAB icon="plus" style={styles.fab} onPress={openAdd} />

      <Portal>
        <Dialog
          visible={addOpen}
          onDismiss={() => setAddOpen(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Agregar persona</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Nombre"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              style={styles.input}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.relationshipButton}
                  icon="chevron-down"
                >
                  Parentezco: {newRelationship}
                </Button>
              }
            >
              {relationshipOptions.map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setNewRelationship(option);
                    setMenuVisible(false);
                  }}
                  title={option}
                />
              ))}
            </Menu>
            <Text style={{ marginTop: 16, marginBottom: 8 }}>
              Selecciona un avatar:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.avatarScroll}
            >
              {avatars.map((av) => (
                <TouchableOpacity
                  key={av}
                  onPress={() => setSelectedAvatar(av)}
                  style={styles.avatarOption}
                >
                  <Image source={avatarImages[av]} style={styles.avatarImage} />
                  {selectedAvatar === av && (
                    <View style={styles.selectedOverlay}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddOpen(false)}>Cancelar</Button>
            <Button onPress={onConfirmAdd}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
});

export default PeopleScreen;
