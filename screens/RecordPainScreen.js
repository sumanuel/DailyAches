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
};

const schema = yup.object({
  pain: yup.string().required("Selecciona un dolor"),
  painLevel: yup
    .number()
    .min(1, "El nivel debe ser al menos 1")
    .max(10, "El nivel debe ser máximo 10")
    .required("Selecciona el nivel de dolor"),
  notes: yup.string(),
});

const RecordPainScreen = ({ navigation, route }) => {
  const { user, createRecordAPI, updateRecordAPI } = useUser();
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
    if (record) {
      setIsEdit(true);
      setEditRecord(record);
      // Prefill
      setValue("pain", record.pain);
      setValue("painLevel", record.painLevel || 5);
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
      painLevel: isEdit && editRecord ? editRecord.painLevel || 5 : 5,
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
        pain_level: data.painLevel,
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
            renderItem={({ item }) => (
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
                  source={painImages[item.image]}
                  style={styles.painImage}
                />
                <Text style={styles.painText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.painGrid}
            showsVerticalScrollIndicator={false}
          />
          {errors.pain && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.pain.message}
            </Text>
          )}

          <Text style={styles.sectionTitle}>Nivel de dolor (1-10)</Text>
          <Controller
            control={control}
            name="painLevel"
            render={({ field: { onChange, value } }) => (
              <View style={styles.painLevelContainer}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.painLevelButton,
                      value === level && styles.selectedPainLevelButton,
                    ]}
                    onPress={() => onChange(level)}
                  >
                    <Text
                      style={[
                        styles.painLevelText,
                        value === level && styles.selectedPainLevelText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.painLevel && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.painLevel.message}
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 16,
  },
  painLevelContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },
  painLevelButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  selectedPainLevelButton: {
    backgroundColor: "#9C27B0",
    borderColor: "#9C27B0",
  },
  painLevelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedPainLevelText: {
    color: "#fff",
  },
  button: { marginTop: 24, marginBottom: 8 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordPainScreen;
