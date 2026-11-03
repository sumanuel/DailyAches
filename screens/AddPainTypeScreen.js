import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button, Card, useTheme as usePaperTheme } from "react-native-paper";
import { PAIN_NAME_MAX_LENGTH, validateName } from "../utils/validation";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import PainIconField from "../components/PainIconField";
import AppTextField from "../components/AppTextField";

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
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = painName.trim();
    const nameError = validateName(painName, {
      label: "El nombre del dolor",
      max: PAIN_NAME_MAX_LENGTH,
    });
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!isEdit) {
      const exists = user.painTypes?.some(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (exists) {
        setError("Ya existe un tipo de dolor con ese nombre.");
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
        setError("Ya existe otro tipo de dolor con ese nombre.");
        return;
      }
    }

    setError("");

    setSaving(true);
    const result =
      isEdit && existingPain
        ? await updatePainType(existingPain.id, trimmedName, selectedImage)
        : await addPainType(trimmedName, selectedImage);
    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    navigation.goBack();
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
        description="Elige un nombre claro y un icono que lo haga reconocible en un vistazo."
      />

      <Card
        style={[
          styles.formCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content>
          <AppTextField
            label="Nombre del dolor"
            value={painName}
            onChangeText={(text) => {
              setPainName(text);
              if (error) setError("");
            }}
            style={styles.textInput}
            autoFocus={!isEdit}
          />

          {error ? (
            <Text
              style={[styles.errorText, { color: paperTheme.colors.error }]}
            >
              {error}
            </Text>
          ) : null}

          <PainIconField
            value={selectedImage}
            onChange={setSelectedImage}
            style={styles.iconField}
          />

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
              loading={saving}
              disabled={saving}
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
    marginBottom: 16,
  },
  iconField: {
    marginBottom: 8,
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
