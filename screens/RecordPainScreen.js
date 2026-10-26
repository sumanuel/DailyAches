import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Alert, Pressable, View } from "react-native";
import {
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
import AppTextField from "../components/AppTextField";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";
import LoadStatusNotice from "../components/LoadStatusNotice";
import PainLevelPicker from "../components/PainLevelPicker";
import {
  DEFAULT_PAIN_LEVEL,
  getLastPainTypeForPerson,
  normalizePainLevel,
} from "../utils/painLevel";

const schema = yup.object({
  pain: yup.string().required("Elige un tipo de dolor."),
  notes: yup.string(),
});

const keyExtractor = (item) => String(item.id ?? item.name);

const RecordPainScreen = ({ navigation, route }) => {
  const {
    user,
    createRecordAPI,
    updateRecordAPI,
    loadPainTypesFromAPI,
    remoteStatus,
  } = useUser();
  const paperTheme = usePaperTheme();
  const [isEdit, setIsEdit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPainType, setSelectedPainType] = useState(null);
  const [painLevel, setPainLevel] = useState(DEFAULT_PAIN_LEVEL);
  const [saving, setSaving] = useState(false);
  const {
    personId: paramPersonId,
    personName: paramPersonName,
    record,
  } = route?.params || {};
  const personId = paramPersonId || (record ? record.personId : null);
  const personName = paramPersonName || (record ? record.personName : null);

  useEffect(() => {
    loadPainTypesFromAPI();
  }, [loadPainTypesFromAPI]);

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

  // Editing: fill the form with the record being edited.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (record) {
      setIsEdit(true);
      setEditRecord(record);
      // Prefill
      setValue("pain", record.pain);
      setValue("notes", record.notes);
      setPainLevel(normalizePainLevel(record.painLevel));
      const matchingPain = painTypes.find((p) => p.name === record.pain);
      if (matchingPain) {
        setSelectedPainType(matchingPain);
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [record, painTypes, setValue]);

  // New record: start with the pain type last used for this person.
  useEffect(() => {
    if (record || selectedPainType) return;
    const last = getLastPainTypeForPerson(user.records, personId, painTypes);
    if (last) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- also sets a react-hook-form value
      setSelectedPainType(last);
      setValue("pain", last.name);
    }
  }, [record, selectedPainType, user.records, personId, painTypes, setValue]);

  const onSubmit = async (data) => {
    if (!selectedPainType || saving) return;

    setSaving(true);
    try {
      const recordData = {
        person_id: personId,
        pain_type_id: selectedPainType.id,
        pain_level: painLevel,
        notes: data.notes,
      };

      const result =
        isEdit && editRecord
          ? await updateRecordAPI(editRecord.id, recordData)
          : await createRecordAPI(recordData);

      if (!result?.success) {
        Alert.alert(
          "No se pudo guardar",
          result?.error || "Inténtalo de nuevo en un momento.",
        );
        return;
      }

      Alert.alert(
        isEdit ? "¡Actualizado!" : "¡Registrado!",
        `${isEdit ? "Registro actualizado" : "Dolor registrado"} para ${personName}: ${selectedPainType.name}`,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo guardar el registro. Inténtalo de nuevo.",
      );
      console.error("Error saving record:", error);
    } finally {
      setSaving(false);
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
        title={`${personName} queda en el radar del dia`}
        description="Aqui se elige el tipo de molestia, se agrega una nota si hace falta y se guarda el episodio con claridad."
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

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.painTypes, hasData: (user.painTypes || []).length > 0, label: "los tipos de dolor", onRetry: loadPainTypesFromAPI },
        ]}
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <AppTextField
            label="Dolor"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholder="Filtrar por nombre"
          />

          <View style={styles.painGrid}>
            {filteredPainTypes.map((item) => {
              const preset = getPainIllustration(
                resolvePainIllustrationKey(item),
              );
              const isSelected = selectedPainType?.name === item.name;

              return (
                <View key={keyExtractor(item)} style={styles.painCell}>
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
                </View>
              );
            })}
          </View>
          {errors.pain && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.pain.message}
            </Text>
          )}

          <PainLevelPicker
            value={painLevel}
            onChange={setPainLevel}
            style={styles.level}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <AppTextField
                label="Notas adicionales (opcional)"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.input}
                contentStyle={styles.notesContent}
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={saving}
            disabled={saving}
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
  painGrid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 8 },
  painCell: { width: "33.333%" },
  painOption: {
    alignItems: "center",
    padding: 12,
    margin: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  painImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  painText: { fontSize: 14, textAlign: "center", fontWeight: "500" },
  level: { marginTop: 16 },
  input: { marginTop: 12 },
  notesContent: { minHeight: 72, textAlignVertical: "top" },
  button: { marginTop: 24, marginBottom: 8, borderRadius: 16 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordPainScreen;
