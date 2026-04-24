import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
  Card,
  Text,
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

  const openAdd = () => {
    navigation.navigate("AddPerson");
  };

  const openEdit = (person) => {
    navigation.navigate("AddPerson", { person });
  };

  const filtered = useMemo(() => user.people || [], [user.people]);

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
        title="Personas registradas para sus achaques"
        description="Desde aqui se agregan personas, se editan sus datos y se abre el registro del malestar que toque ese dia."
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
                Agrega una persona para empezar a registrar sus molestias con
                claridad y un tono ligero.
              </Text>
              <Text
                style={[styles.emptyHint, { color: paperTheme.colors.primary }]}
              >
                El boton + ya esta listo para sumar a la primera persona del
                listado.
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
                      Toca para registrar el achaque que presente
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="square-edit-outline"
                    onPress={() => openEdit(p)}
                    accessibilityLabel="Editar persona"
                  />
                  <IconButton
                    icon="delete-circle-outline"
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
