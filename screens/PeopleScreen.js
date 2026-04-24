import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  FAB,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getAvatarIllustration,
  resolveAvatarIllustrationKey,
} from "../constants/illustrations";

const PeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, addPerson, removePerson, updatePerson, loadPeopleFromAPI } =
    useUser();

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

  useEffect(() => {
    loadPeopleFromAPI();
  }, []);

  const handleRemovePerson = (person) => {
    Alert.alert(
      "Eliminar persona",
      `¿Quitamos a ${person.name} de tu radar de achaques?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removePerson(person.id),
        },
      ],
    );
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        eyebrow="PERSONAS"
        title="Tu elenco oficial del drama corporal"
        description="Busca rapido, agrega nuevas personas y entra directo a registrar lo que el cuerpo decidio improvisar hoy."
      >
        <View style={styles.heroStats}>
          <Text
            style={[
              styles.heroChip,
              {
                backgroundColor: paperTheme.colors.accentSun,
                color: paperTheme.colors.onSurface,
              },
            ]}
          >
            Activas: {filtered.length}
          </Text>
          <Text
            style={[
              styles.heroChip,
              {
                backgroundColor: paperTheme.colors.accentMint,
                color: paperTheme.colors.onSurface,
              },
            ]}
          >
            Total: {user.people.length}
          </Text>
        </View>
      </HeroPanel>

      <Card
        style={[
          styles.searchCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content style={styles.searchContent}>
          <TextInput
            mode="outlined"
            placeholder="Buscar persona o complicidad..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            left={<TextInput.Icon icon="account-search" />}
          />
        </Card.Content>
      </Card>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Card
            style={[
              styles.emptyCard,
              { backgroundColor: paperTheme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Todavia no hay elenco
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.muted,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Agrega a alguien para empezar a registrar dolores con elegancia
                y un poco de humor.
              </Text>
              <Text
                style={[styles.emptyHint, { color: paperTheme.colors.primary }]}
              >
                El boton + ya esta listo para fichar a la primera victima del
                dia.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card
              key={p.id}
              style={[
                styles.card,
                { backgroundColor: paperTheme.colors.surface },
              ]}
              onPress={() => onSelectPerson(p)}
            >
              <Card.Content style={styles.row}>
                <View style={styles.rowLeft}>
                  {p.avatar ? (
                    <IllustrationBadge
                      preset={getAvatarIllustration(
                        resolveAvatarIllustrationKey(p.avatar),
                      )}
                      size={52}
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
                        marginTop: 4,
                      }}
                    >
                      {p.relationship || "Relacion sin etiqueta"}
                    </Text>
                    <Text
                      style={[
                        styles.ctaText,
                        { color: paperTheme.colors.primary },
                      ]}
                    >
                      Toca para registrar el achaque del momento
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
                    onPress={() => handleRemovePerson(p)}
                    accessibilityLabel="Eliminar persona"
                  />
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
        color={paperTheme.colors.onPrimary}
        onPress={openAdd}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  searchCard: { borderRadius: 24, overflow: "hidden" },
  searchContent: { paddingVertical: 6 },
  searchInput: { backgroundColor: "transparent" },
  list: { flex: 1, marginTop: 12 },
  emptyCard: { borderRadius: 24, overflow: "hidden" },
  emptyTitle: { marginBottom: 6, fontWeight: "800" },
  emptyHint: { marginTop: 12, fontWeight: "700" },
  card: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    flexShrink: 0,
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  meta: { flex: 1 },
  ctaText: { marginTop: 6, fontSize: 12, fontWeight: "700" },
  muted: { marginTop: 2, lineHeight: 20 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  actions: { flexDirection: "row" },
});

export default PeopleScreen;
