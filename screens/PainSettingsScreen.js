import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const painImages = {
  "DolorDeCabeza.png": require("../assets/resourse_one/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/resourse_one/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/resourse_one/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/resourse_one/Mujer feliz.png"),
};

const PainSettingsScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, addPainType, removePainType, updatePainType } = useUser();

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPain, setNewPain] = useState("");
  const [selectedImage, setSelectedImage] = useState("Mujer feliz.png");
  const [isEdit, setIsEdit] = useState(false);
  const [editPain, setEditPain] = useState(null);

  const open = () => {
    setNewPain("");
    setSelectedImage("Mujer feliz.png");
    setIsEdit(false);
    setEditPain(null);
    setDialogVisible(true);
  };

  const openEdit = (pain) => {
    setNewPain(pain.name);
    setSelectedImage(pain.image);
    setIsEdit(true);
    setEditPain(pain);
    setDialogVisible(true);
  };

  const close = () => setDialogVisible(false);

  const onAdd = () => {
    if (isEdit && editPain) {
      updatePainType(editPain.name, newPain, selectedImage);
    } else {
      addPainType(newPain, selectedImage);
    }
    close();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Configurar dolores" />
        <Card.Content>
          <Text style={styles.sub}>
            Estos son los tipos disponibles al registrar un dolor.
          </Text>
        </Card.Content>

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
                  onPress={() => openEdit(item)}
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

        <Card.Actions>
          <Button mode="contained" onPress={open}>
            Agregar dolor
          </Button>
        </Card.Actions>
      </Card>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={close} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {isEdit ? "Editar tipo de dolor" : "Agregar nuevo tipo de dolor"}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Nombre del dolor"
              value={newPain}
              onChangeText={setNewPain}
              style={styles.textInput}
              mode="outlined"
              theme={{ colors: { primary: "#9C27B0" } }}
            />
            <Text style={styles.imageLabel}>Selecciona una imagen:</Text>
            <View style={styles.imageSelection}>
              {Object.keys(painImages).map((img) => (
                <TouchableOpacity
                  key={img}
                  onPress={() => setSelectedImage(img)}
                  style={styles.imageOption}
                >
                  <Image source={painImages[img]} style={styles.imagePreview} />
                  {selectedImage === img && (
                    <View style={styles.selectedOverlay}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={close} style={styles.cancelButton}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={onAdd}
              disabled={!newPain.trim()}
              style={styles.addButton}
              buttonColor="#9C27B0"
            >
              {isEdit ? "Actualizar" : "Agregar"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { width: "100%", borderRadius: 16, overflow: "hidden" },
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
  dialog: { borderRadius: 20 },
  dialogTitle: { textAlign: "center", fontSize: 18, fontWeight: "bold" },
  dialogContent: { paddingHorizontal: 24, paddingVertical: 16 },
  textInput: { marginBottom: 16 },
  imageLabel: { marginBottom: 8, fontSize: 16, fontWeight: "500" },
  imageSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  imageOption: { position: "relative" },
  imagePreview: { width: 50, height: 50, borderRadius: 25 },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(156, 39, 176, 0.8)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "white", fontSize: 24, fontWeight: "bold" },
  dialogActions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  cancelButton: { marginRight: 8 },
  addButton: { flex: 1 },
});

export default PainSettingsScreen;
