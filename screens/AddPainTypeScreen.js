import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  TextInput,
  Button,
  Card,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
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

const AddPainTypeScreen = ({ navigation, route }) => {
  const paperTheme = usePaperTheme();
  const { addPainType, updatePainType, user } = useUser();

  const isEdit = route.params?.isEdit || false;
  const existingPain = route.params?.pain || null;

  const [painName, setPainName] = useState(existingPain?.name || "");
  const [selectedImage, setSelectedImage] = useState(
    existingPain?.image || "Mujer feliz.png",
  );
  const [error, setError] = useState("");

  const handleSave = async () => {
    const trimmedName = painName.trim();
    if (!trimmedName) {
      setError("El nombre del dolor es obligatorio");
      return;
    }

    if (!isEdit) {
      const exists = user.painTypes?.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (exists) {
        setError("Ya existe un tipo de dolor con este nombre");
        return;
      }
    }

    if (isEdit && existingPain) {
      const exists = user.painTypes?.some(
        (p) =>
          p.id !== existingPain.id &&
          p.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (exists) {
        setError("Ya existe otro tipo de dolor con este nombre");
        return;
      }
    }

    setError("");

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
          <Pressable
            key={img}
            onPress={() => setSelectedImage(img)}
            style={[
              styles.imageOption,
              {
                borderColor:
                  selectedImage === img
                    ? paperTheme.colors.primary
                    : "transparent",
                backgroundColor:
                  selectedImage === img
                    ? paperTheme.colors.primaryContainer
                    : paperTheme.colors.surfaceVariant,
              },
              selectedImage === img && styles.imageOptionSelected,
            ]}
          >
            <Image source={painImages[img]} style={styles.imagePreview} />
            {selectedImage === img && (
              <View style={styles.selectedOverlay}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow={isEdit ? "EDITAR TIPO" : "NUEVO TIPO"}
        title={
          isEdit
            ? "Dale un mejor nombre al achaque"
            : "Agrega un dolor con identidad propia"
        }
        description="Elige un nombre claro y una imagen que lo haga reconocible en un vistazo."
      />

      <Card
        style={[
          styles.formCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content>
          <TextInput
            label="Nombre del dolor"
            value={painName}
            onChangeText={(text) => {
              setPainName(text);
              if (error) setError("");
            }}
            style={styles.textInput}
            mode="outlined"
            autoFocus={!isEdit}
          />

          {error ? (
            <Text
              style={[styles.errorText, { color: paperTheme.colors.error }]}
            >
              {error}
            </Text>
          ) : null}

          <Text
            style={[
              styles.sectionTitle,
              { color: paperTheme.colors.onSurface },
            ]}
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
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  formCard: { borderRadius: 24, overflow: "hidden" },
  textInput: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
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
    transform: [{ scale: 1.03 }],
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
    backgroundColor: "rgba(0,0,0,0.2)",
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
    borderRadius: 16,
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default AddPainTypeScreen;
