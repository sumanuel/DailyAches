import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
  const { user, removePainType } = useUser();

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  const openAddScreen = () => {
    navigation.navigate("AddPainType", { isEdit: false });
  };

  const openEditScreen = (pain) => {
    navigation.navigate("AddPainType", { isEdit: true, pain });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.headerCard}>
        <Card.Title title="Configurar dolores" />
        <Card.Content>
          <Text style={styles.sub}>
            Estos son los tipos disponibles al registrar un dolor.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.listCard}>
        <FlatList
          data={painTypes}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Image source={painImages[item.image]} style={styles.itemImage} />
              <Text style={styles.itemText}>{item.name}</Text>
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
                  onPress={() => removePainType(item.name)}
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
        style={styles.fab}
        accessibilityLabel="Agregar nuevo tipo de dolor"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  headerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  listCard: { flex: 1, borderRadius: 16, overflow: "hidden" },
  sub: { opacity: 0.7, marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  itemRow: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  itemText: { flex: 1, fontSize: 16 },
  itemActions: { flexDirection: "row" },
  sep: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PainSettingsScreen;
