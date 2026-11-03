import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Alert } from "react-native";
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
import AppTextField from "../components/AppTextField";
import LoadStatusNotice from "../components/LoadStatusNotice";
import PainLevelPicker from "../components/PainLevelPicker";
import PainTypeField from "../components/PainTypeField";
import {
  DEFAULT_PAIN_LEVEL,
  getLastPainTypeForPerson,
  normalizePainLevel,
} from "../utils/painLevel";
import { DEFAULT_RECORD_DATE, resolveRecordDate } from "../utils/recordDate";
import RecordDateField from "../components/RecordDateField";

const schema = yup.object({
  pain: yup.string().required("Elige un tipo de dolor."),
  notes: yup.string(),
});

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
  const [selectedPainType, setSelectedPainType] = useState(null);
  const [painLevel, setPainLevel] = useState(DEFAULT_PAIN_LEVEL);
  const [dateChoice, setDateChoice] = useState({
    option: DEFAULT_RECORD_DATE,
    customDate: null,
  });
  const [dateError, setDateError] = useState("");
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

    // Editing keeps the date the record already has.
    const when = isEdit ? {} : resolveRecordDate(dateChoice);
    if (when.error) {
      setDateError(when.error);
      return;
    }
    setDateError("");

    setSaving(true);
    try {
      const recordData = {
        person_id: personId,
        pain_type_id: selectedPainType.id,
        pain_level: painLevel,
        notes: data.notes,
      };
      if (when.createdAt) recordData.created_at = when.createdAt;

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

      // A new record is celebrated by the progress banner; an edit has no points.
      if (isEdit) {
        Alert.alert(
          "¡Actualizado!",
          `Registro actualizado para ${personName}: ${selectedPainType.name}`,
        );
      }
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
        compact
        eyebrow={isEdit ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
        title={`${personName} queda en el radar del dia`}
        description="Elige el tipo de molestia, agrega una nota si hace falta y guarda el episodio."
      />

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.painTypes, hasData: (user.painTypes || []).length > 0, label: "los tipos de dolor", onRetry: loadPainTypesFromAPI },
        ]}
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <PainTypeField
            value={selectedPainType}
            options={painTypes}
            onChange={(pain) => {
              setSelectedPainType(pain);
              setValue("pain", pain.name, { shouldValidate: true });
            }}
            error={errors.pain?.message}
          />

          <PainLevelPicker
            value={painLevel}
            onChange={setPainLevel}
            style={styles.level}
          />

          {isEdit ? null : (
            <RecordDateField
              value={dateChoice}
              onChange={(next) => {
                setDateChoice(next);
                setDateError("");
              }}
              error={dateError}
              style={styles.when}
            />
          )}

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
  card: { borderRadius: 24, overflow: "hidden" },
  level: { marginTop: 16 },
  when: { marginTop: 16 },
  input: { marginTop: 12 },
  notesContent: { minHeight: 72, textAlignVertical: "top" },
  button: { marginTop: 24, marginBottom: 8, borderRadius: 16 },
});

export default RecordPainScreen;
