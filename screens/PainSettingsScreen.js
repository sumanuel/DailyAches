import React, { useMemo, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert } from "react-native";
import {
  Card,
  FAB,
  IconButton,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";

const PainSettingsScreen = () => {
  const paperTheme = usePaperTheme();
  const navigation = useNavigation();
  const { user, removePainType, loadPainTypesFromAPI } = useUser();

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  useEffect(() => {
    loadPainTypesFromAPI();
  }, []);

  const openAddScreen = () => {
    navigation.navigate("AddPainType", { isEdit: false });
  };

  const openEditScreen = (pain) => {
    navigation.navigate("AddPainType", { isEdit: true, pain });
  };

  const handleDeletePainType = async (painType) => {
    Alert.alert(
      "Eliminar tipo de dolor",
      `¿Estás seguro de que quieres eliminar "${painType.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await removePainType(painType.id);
              if (result.success) {
                Alert.alert("Éxito", "Tipo de dolor eliminado correctamente");
              } else {
                // Check if the error is because the pain type is being used
                if (
                  result.error &&
                  result.error.includes("being used in existing records")
                ) {
                  Alert.alert(
                    "No se puede eliminar",
                    "Este tipo de dolor no se puede eliminar porque ya está siendo usado en registros existentes.",
                  );
                } else {
                  Alert.alert(
                    "Advertencia",
                    "El tipo de dolor se eliminó localmente, pero puede que no se haya sincronizado con el servidor.",
                  );
                }
              }
            } catch (error) {
              console.error("Error deleting pain type:", error);
              Alert.alert(
                "Error",
                "No se pudo eliminar el tipo de dolor. Inténtalo de nuevo.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        eyebrow="CATALOGO DE DOLORES"
        title="Ordena el menu del drama corporal"
        description="Edita nombres e imagenes para que registrar un dolor sea rapido, claro y con personalidad."
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
          Tipos: {painTypes.length}
        </Text>
      </HeroPanel>

      <Card
        style={[
          styles.listCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <View
          style={[
            styles.listHeader,
            { borderBottomColor: paperTheme.colors.outlineVariant },
          ]}
        >
          <View>
            <Text variant="titleMedium" style={styles.listTitle}>
              Tipos disponibles
            </Text>
            <Text
              style={[
                styles.listSubtitle,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Cada fila puede editarse o retirarse del catálogo.
            </Text>
          </View>
          <Text
            style={[
              styles.listCount,
              {
                backgroundColor: paperTheme.colors.secondaryContainer,
                color: paperTheme.colors.onSecondaryContainer,
              },
            ]}
          >
            {painTypes.length}
          </Text>
        </View>

        <FlatList
          data={painTypes}
          keyExtractor={(item) => item.name}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No hay tipos cargados
              </Text>
              <Text
                style={{
                  color: paperTheme.colors.onSurfaceVariant,
                  textAlign: "center",
                }}
              >
                Agrega uno nuevo para empezar a personalizar el registro.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemRow,
                { backgroundColor: paperTheme.colors.surfaceVariant },
              ]}
            >
              <View style={styles.itemLead}>
                <IllustrationBadge
                  preset={getPainIllustration(resolvePainIllustrationKey(item))}
                  size={56}
                  style={styles.itemImage}
                />
                <View style={styles.itemMeta}>
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text
                    style={[
                      styles.itemSubtext,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Disponible para nuevos registros
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <IconButton
                  icon="square-edit-outline"
                  size={20}
                  style={[
                    styles.itemActionButton,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  onPress={() => openEditScreen(item)}
                  accessibilityLabel={`Editar ${item.name}`}
                />
                <IconButton
                  icon="delete-circle-outline"
                  size={20}
                  style={[
                    styles.itemActionButton,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  onPress={() => handleDeletePainType(item)}
                  accessibilityLabel={`Eliminar ${item.name}`}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </Card>

      <FAB
        icon="plus"
        onPress={openAddScreen}
        style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
        color={paperTheme.colors.onPrimary}
        accessibilityLabel="Agregar nuevo tipo de dolor"
      />
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
  listCard: { flex: 1, borderRadius: 24, overflow: "hidden" },
  listHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listTitle: { fontWeight: "800" },
  listSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  listCount: {
    minWidth: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 92 },
  emptyWrap: { paddingVertical: 32, alignItems: "center", gap: 8 },
  emptyTitle: { fontWeight: "800" },
  itemRow: {
    padding: 14,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  itemLead: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  itemImage: { flexShrink: 0 },
  itemMeta: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: "700" },
  itemSubtext: { marginTop: 4, fontSize: 12, lineHeight: 17 },
  itemActions: { flexDirection: "row", gap: 8 },
  itemActionButton: { margin: 0 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default PainSettingsScreen;
