import React, { useMemo, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Card,
  Text,
  IconButton,
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

const HistoryPeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, loadPeopleFromAPI } = useUser();

  useEffect(() => {
    loadPeopleFromAPI();
  }, []);

  const filtered = useMemo(() => user.people || [], [user.people]);

  const onSelectPerson = (person) => {
    navigation.navigate("HistoryDetail", {
      personId: person.id,
      personName: person.name,
    });
  };

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        eyebrow="HISTORIAL"
        title="Historial disponible por persona"
        description="Cada ficha abre el archivo completo de molestias, fechas y episodios registrados para esa persona."
      >
        <Text
          style={[
            styles.heroChip,
            {
              backgroundColor: paperTheme.colors.accentBerry,
              color: paperTheme.colors.onSurface,
            },
          ]}
        >
          Coincidencias: {filtered.length}
        </Text>
      </HeroPanel>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Card
            style={[
              styles.card,
              { backgroundColor: paperTheme.colors.surface },
            ]}
          >
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Sin expedientes todavia
              </Text>
              <Text
                style={{
                  color: paperTheme.colors.onSurfaceVariant,
                  marginTop: 4,
                  lineHeight: 20,
                }}
              >
                Agrega una persona en Registro para empezar a construir su
                historial.
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
                      Toca para ver todo su historial
                    </Text>
                  </View>
                </View>
                <IconButton icon="arrow-right-circle-outline" />
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  list: { flex: 1, marginTop: 12 },
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
  emptyTitle: { fontWeight: "800" },
  ctaText: { marginTop: 6, fontSize: 12, fontWeight: "700" },
});

export default HistoryPeopleScreen;
