import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  RadioButton,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUser } from "../context/UserContext";

const painImages = {
  "DolorDeCabeza.png": require("../assets/resourse_one/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/resourse_one/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/resourse_one/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/resourse_one/Mujer feliz.png"),
  "Cabeza.png": require("../assets/resourse_one/Cabeza.png"),
  "Espalda.png": require("../assets/resourse_one/Espalda.png"),
  "Piernas.png": require("../assets/resourse_one/Piernas.png"),
  "Alegre.png": require("../assets/resourse_one/Alegre.png"),
  "Saltando.png": require("../assets/resourse_one/Saltando.png"),
};

// Función para obtener la imagen correcta para un tipo de dolor
const getPainImage = (painType) => {
  // Mapear por nombre del tipo de dolor (esta es la forma más confiable)
  const nameMappings = {
    "Dolor de cabeza": "DolorDeCabeza.png",
    "Dolor de espalda": "DolorDeEspalda.png",
    "Dolor menstrual": "DolorDePiernas.png",
    "Dolor de estómago": "DolorDePiernas.png",
    "Dolor de garganta": "DolorDePiernas.png",
    "Dolor de dientes": "DolorDePiernas.png",
    Otro: "Mujer feliz.png",
  };

  // Si el pain type tiene un image específico configurado, úsalo
  if (
    painType.image &&
    typeof painType.image === "string" &&
    painType.image.trim()
  ) {
    const directImage = painImages[painType.image];
    if (directImage) {
      return directImage;
    }
  }

  // De lo contrario, usa el mapeo por nombre
  const mappedImage = nameMappings[painType.name] || "Mujer feliz.png";
  return painImages[mappedImage] || painImages["Mujer feliz.png"];
};

const schema = yup.object({
  pain: yup.string().required("Selecciona un dolor"),
  notes: yup.string(),
});

const RecordPainScreen = ({ navigation, route }) => {
  const { user, createRecordAPI, updateRecordAPI, loadPainTypesFromAPI } =
    useUser();
  const paperTheme = usePaperTheme();
  const [customPain, setCustomPain] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPainType, setSelectedPainType] = useState(null);
  const {
    personId: paramPersonId,
    personName: paramPersonName,
    record,
  } = route?.params || {};
  const personId = paramPersonId || (record ? record.personId : null);
  const personName = paramPersonName || (record ? record.personName : null);

  useEffect(() => {
    // Load pain types from API when screen opens
    loadPainTypesFromAPI();
  }, [loadPainTypesFromAPI]);

  useEffect(() => {
    if (record) {
      setIsEdit(true);
      setEditRecord(record);
      // Prefill
      setValue("pain", record.pain);
      setValue("notes", record.notes);
      const matchingPain = painTypes.find((p) => p.name === record.pain);
      if (matchingPain) {
        setSelectedPainType(matchingPain);
      }
    }
  }, [record, painTypes, setValue]);

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  const filteredPainTypes = useMemo(() => {
    if (!searchQuery.trim()) return painTypes;
    return painTypes.filter((pain) =>
      pain.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [painTypes, searchQuery]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pain: isEdit && editRecord ? editRecord.pain : "",
      notes: isEdit && editRecord ? editRecord.notes : "",
    },
  });

  const selectedPain = watch("pain");

  const onSubmit = async (data) => {
    if (!selectedPainType) return; // Should not happen

    try {
      const recordData = {
        person_id: personId,
        pain_type_id: selectedPainType.id,
        pain_level: 5, // Default pain level
        notes: data.notes,
      };

      if (isEdit && editRecord) {
        await updateRecordAPI(editRecord.id, recordData);
        Alert.alert(
          "¡Actualizado!",
          `Registro actualizado para ${personName}: ${selectedPainType.name}`
        );
      } else {
        await createRecordAPI(recordData);
        Alert.alert(
          "¡Registrado!",
          `Dolor registrado para ${personName}: ${selectedPainType.name}`
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo guardar el registro. Inténtalo de nuevo."
      );
      console.error("Error saving record:", error);
    }
  };

  if (!personId || !personName) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <Card style={styles.card}>
          <Card.Title title="Registrar" />
          <Card.Content>
            <Text>Selecciona una persona primero desde “Registro”.</Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Volver
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ backgroundColor: paperTheme.colors.background }]}
      contentContainerStyle={styles.container}
    >
      <Card style={styles.card}>
        <Card.Title
          title={isEdit ? "Editar registro" : "Registrar"}
          subtitle={personName}
        />
        <Card.Content>
          <TextInput
            label="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
            theme={{ colors: { primary: "#9C27B0" } }}
          />
          <FlatList
            data={filteredPainTypes}
            keyExtractor={(item) => item.name}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const imageSource = getPainImage(item);

              return (
                <TouchableOpacity
                  style={[
                    styles.painOption,
                    selectedPainType?.name === item.name &&
                      styles.selectedPainOption,
                  ]}
                  onPress={() => {
                    setSelectedPainType(item);
                    setValue("pain", item.name);
                  }}
                >
                  <Image
                    source={imageSource}
                    style={styles.painImage}
                    onError={() =>
                      console.log(`Error loading image for: ${item.name}`)
                    }
                  />
                  <Text style={styles.painText}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.painGrid}
            showsVerticalScrollIndicator={false}
          />
          {errors.pain && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.pain.message}
            </Text>
          )}

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Notas adicionales (opcional)"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          >
            {isEdit ? "Actualizar registro" : "Registrar (+10 puntos)"}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 20, overflow: "hidden", elevation: 4 },
  label: { marginTop: 8, marginBottom: 12, fontWeight: "700", fontSize: 16 },
  searchInput: { marginBottom: 16 },
  painGrid: { paddingVertical: 8 },
  painOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 4,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  selectedPainOption: {
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#9C27B0",
  },
  painImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  painText: { fontSize: 14, textAlign: "center", fontWeight: "500" },
  input: { marginTop: 12 },
  button: { marginTop: 24, marginBottom: 8 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordPainScreen;
