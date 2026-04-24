import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, FlatList } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";

const schema = yup.object({
  pain: yup.string().required("Selecciona un dolor"),
  notes: yup.string(),
});

const RecordPainScreen = ({ navigation, route }) => {
  const { user, createRecordAPI, updateRecordAPI, loadPainTypesFromAPI } =
    useUser();
  const paperTheme = usePaperTheme();
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
    loadPainTypesFromAPI();
  }, []);

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
      pain.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [painTypes, searchQuery]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      pain: isEdit && editRecord ? editRecord.pain : "",
      notes: isEdit && editRecord ? editRecord.notes : "",
    },
  });

  const onSubmit = async (data) => {
    if (!selectedPainType) return;

    try {
      const recordData = {
        person_id: personId,
        pain_type_id: selectedPainType.id,
        pain_level: 5,
        notes: data.notes,
      };

      if (isEdit && editRecord) {
        await updateRecordAPI(editRecord.id, recordData);
        Alert.alert(
          "¡Actualizado!",
          `Registro actualizado para ${personName}: ${selectedPainType.name}`,
        );
      } else {
        await createRecordAPI(recordData);
        Alert.alert(
          "¡Registrado!",
          `Dolor registrado para ${personName}: ${selectedPainType.name}`,
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo guardar el registro. Inténtalo de nuevo.",
      );
      console.error("Error saving record:", error);
    }
  };

  if (!personId || !personName) {
    return (
      <AppScreen>
        <HeroPanel
          compact
          eyebrow="ANTES DE EMPEZAR"
          title="Falta elegir a la persona"
          description="Primero entra a Registro y selecciona a alguien. Luego ya podemos documentar el achaque con categoria y estilo."
        />
        <Card
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
        >
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
      </AppScreen>
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        eyebrow={isEdit ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
        title={`${personName} entra al radar de hoy`}
        description="Elige el tipo de molestia, deja una nota si hace falta y guarda el capitulo de hoy sin perder claridad."
      >
        {selectedPainType ? (
          <Text
            style={[
              styles.selectionChip,
              {
                backgroundColor: paperTheme.colors.accentSun,
                color: paperTheme.colors.onSurface,
              },
            ]}
          >
            Seleccionado: {selectedPainType.name}
          </Text>
        ) : null}
      </HeroPanel>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <TextInput
            label="Buscar dolor"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
          />

          <FlatList
            data={filteredPainTypes}
            keyExtractor={(item) => item.name}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const preset = getPainIllustration(
                resolvePainIllustrationKey(item),
              );
              const isSelected = selectedPainType?.name === item.name;

              return (
                <Pressable
                  style={[
                    styles.painOption,
                    {
                      backgroundColor: isSelected
                        ? paperTheme.colors.primaryContainer
                        : paperTheme.colors.surfaceVariant,
                      borderColor: isSelected
                        ? paperTheme.colors.primary
                        : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setSelectedPainType(item);
                    setValue("pain", item.name);
                  }}
                >
                  <IllustrationBadge
                    preset={preset}
                    size={60}
                    selected={isSelected}
                    style={styles.painImage}
                  />
                  <Text
                    style={[
                      styles.painText,
                      {
                        color: isSelected
                          ? paperTheme.colors.onPrimaryContainer
                          : paperTheme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
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
                mode="outlined"
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
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  selectionChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  card: { borderRadius: 24, overflow: "hidden" },
  searchInput: { marginBottom: 16 },
  painGrid: { paddingVertical: 8 },
  painOption: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  painImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  painText: { fontSize: 14, textAlign: "center", fontWeight: "500" },
  input: { marginTop: 12 },
  button: { marginTop: 24, marginBottom: 8, borderRadius: 16 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordPainScreen;
