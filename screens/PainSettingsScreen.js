import React, { useMemo, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert } from "react-native";
import {
  Card,
  FAB,
  IconButton,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

const painImages = {
  "Alegre.png": require("../assets/resourse_one/Alegre.png"),
  "Cabeza.png": require("../assets/resourse_one/Cabeza.png"),
  "Cervical.png": require("../assets/resourse_one/Cervical.png"),
  "Diarrea.png": require("../assets/resourse_one/Diarrea.png"),
  "DolorDeCabeza.png": require("../assets/resourse_one/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/resourse_one/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/resourse_one/DolorDePiernas.png"),
  "Espalda.png": require("../assets/resourse_one/Espalda.png"),
  "Fiebre.png": require("../assets/resourse_one/Fiebre.png"),
  "Gripe.png": require("../assets/resourse_one/Gripe.png"),
  "Mamitis.png": require("../assets/resourse_one/Mamitis.png"),
  "Manos.png": require("../assets/resourse_one/Manos.png"),
  "Mareo.png": require("../assets/resourse_one/Mareo.png"),
  "Muela.png": require("../assets/resourse_one/Muela.png"),
  "Mujer feliz.png": require("../assets/resourse_one/Mujer feliz.png"),
  "Papitis.png": require("../assets/resourse_one/Papitis.png"),
  "Piernas.png": require("../assets/resourse_one/Piernas.png"),
  "Resaca.png": require("../assets/resourse_one/Resaca.png"),
  "Saltando.png": require("../assets/resourse_one/Saltando.png"),
  "Senos.png": require("../assets/resourse_one/Senos.png"),
  "Trasnocho.png": require("../assets/resourse_one/Trasnocho.png"),
  "Vientre.png": require("../assets/resourse_one/Vientre.png"),
  "Vomito.png": require("../assets/resourse_one/Vomito.png"),
};

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
            <View style={styles.itemRow}>
              <Image source={painImages[item.image]} style={styles.itemImage} />
              <View style={styles.itemMeta}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text
                  style={{
                    color: paperTheme.colors.onSurfaceVariant,
                    fontSize: 12,
                  }}
                >
                  Disponible para nuevos registros
                </Text>
              </View>
              <View style={styles.itemActions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => openEditScreen(item)}
                  accessibilityLabel={`Editar ${item.name}`}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeletePainType(item)}
                  accessibilityLabel={`Eliminar ${item.name}`}
                />
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.sep,
                { backgroundColor: paperTheme.colors.outlineVariant },
              ]}
            />
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
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyWrap: { paddingVertical: 32, alignItems: "center", gap: 8 },
  emptyTitle: { fontWeight: "800" },
  itemRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemImage: { width: 48, height: 48, borderRadius: 18, marginRight: 12 },
  itemMeta: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: "700" },
  itemActions: { flexDirection: "row" },
  sep: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  fab: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});

export default PainSettingsScreen;
