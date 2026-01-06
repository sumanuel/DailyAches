import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  Appbar,
  TextInput,
  Button,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
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

const AddPainTypeScreen = ({ navigation, route }) => {
  const paperTheme = usePaperTheme();
  const { addPainType, updatePainType, user } = useUser();

  const isEdit = route.params?.isEdit || false;
  const existingPain = route.params?.pain || null;

  const [painName, setPainName] = useState(existingPain?.name || "");
  const [selectedImage, setSelectedImage] = useState(
    existingPain?.image || "Mujer feliz.png"
  );
  const [error, setError] = useState("");

  const handleSave = async () => {
    const trimmedName = painName.trim();
    if (!trimmedName) {
      setError("El nombre del dolor es obligatorio");
      return;
    }

    // Validar duplicados (solo para creación, no para edición)
    if (!isEdit) {
      const exists = user.painTypes?.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (exists) {
        setError("Ya existe un tipo de dolor con este nombre");
        return;
      }
    }

    // Para edición, validar que no haya otro con el mismo nombre
    if (isEdit && existingPain) {
      const exists = user.painTypes?.some(
        (p) =>
          p.id !== existingPain.id &&
          p.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (exists) {
        setError("Ya existe otro tipo de dolor con este nombre");
        return;
      }
    }

    setError(""); // Limpiar error

    try {
      if (isEdit && existingPain) {
        await updatePainType(existingPain.id, trimmedName, selectedImage);
      } else {
        await addPainType(trimmedName, selectedImage);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving pain type:", error);
      setError(error.message || "Error al guardar el tipo de dolor");
    }
  };

  const renderImageGrid = () => {
    const images = Object.keys(painImages);

    return (
      <View style={styles.imagesGrid}>
        {images.map((img) => (
          <TouchableOpacity
            key={img}
            onPress={() => setSelectedImage(img)}
            style={[
              styles.imageOption,
              selectedImage === img && styles.imageOptionSelected,
            ]}
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
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Appbar.Header style={{ backgroundColor: paperTheme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={isEdit ? "Editar tipo de dolor" : "Agregar tipo de dolor"}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label="Nombre del dolor"
          value={painName}
          onChangeText={(text) => {
            setPainName(text);
            if (error) setError(""); // Limpiar error al escribir
          }}
          style={styles.textInput}
          mode="outlined"
          theme={{ colors: { primary: paperTheme.colors.primary } }}
          autoFocus={!isEdit}
        />

        {error ? (
          <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
            {error}
          </Text>
        ) : null}

        <Text
          style={[styles.sectionTitle, { color: paperTheme.colors.onSurface }]}
        >
          Selecciona una imagen:
        </Text>

        {renderImageGrid()}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!painName.trim()}
            style={styles.saveButton}
          >
            {isEdit ? "Actualizar" : "Agregar"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  textInput: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  imageOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  imageOptionSelected: {
    borderColor: "#6B45C4",
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(107, 69, 196, 0.8)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default AddPainTypeScreen;
