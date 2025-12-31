import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
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
  notes: yup.string(),
});

const RecordPainScreen = ({ navigation, route }) => {
  const { user, addRecord, updateRecord } = useUser();
  const paperTheme = usePaperTheme();
  const [customPain, setCustomPain] = useState("");
  const [selectedImage, setSelectedImage] = useState("DolorDeCabeza.png");
  const [isEdit, setIsEdit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
      setValue("notes", record.notes);
      if (
        record.pain &&
        !painTypes.some((p) => p.name === record.pain) &&
        record.pain !== "Otro"
      ) {
        setCustomPain(record.pain);
      }
      setSelectedImage(record.image || "DolorDeCabeza.png");
    }
  }, [record, painTypes, setValue]);

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

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

  const onSubmit = (data) => {
    const normalizedPain =
      data.pain === "Otro" ? (customPain || "").trim() || "Otro" : data.pain;

    if (isEdit && editRecord) {
      updateRecord(editRecord.id, {
        pain: normalizedPain,
        notes: data.notes,
        image: selectedImage,
      });
      Alert.alert(
        "¡Actualizado!",
        `Registro actualizado para ${personName}: ${normalizedPain}`
      );
      navigation.goBack();
    } else {
      addRecord({
        personId,
        personName,
        pain: normalizedPain,
        notes: data.notes,
        image: selectedImage,
      });
      Alert.alert(
        "¡Registrado!",
        `Dolor registrado para ${personName}: ${normalizedPain}`
      );
      navigation.goBack();
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
          <Card.Title title="Registrar dolor" />
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
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.card}>
        <Card.Title
          title={isEdit ? "Editar registro" : "Registrar dolor"}
          subtitle={personName}
        />
        <Card.Content>
          <Text
            style={[
              styles.label,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Selecciona el dolor
          </Text>
          <Controller
            control={control}
            name="pain"
            render={({ field: { onChange, value } }) => (
              <RadioButton.Group onValueChange={onChange} value={value}>
                {painTypes.map((pain) => (
                  <View key={pain.name} style={styles.radioItem}>
                    <RadioButton value={pain.name} />
                    <Text>{pain.name}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            )}
          />
          {selectedPain === "Otro" && (
            <TextInput
              label="Especifica el dolor"
              value={customPain}
              onChangeText={setCustomPain}
              style={styles.input}
            />
          )}
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

          <Text
            style={[
              styles.label,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Selecciona una imagen representativa:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {Object.keys(painImages).map((img) => (
              <TouchableOpacity
                key={img}
                onPress={() => setSelectedImage(img)}
                style={styles.imageOption}
              >
                <Image
                  source={painImages[img]}
                  style={[
                    styles.imagePreview,
                    selectedImage === img && styles.selectedImage,
                  ]}
                />
                {selectedImage === img && (
                  <View style={styles.selectedOverlay}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          >
            {isEdit ? "Actualizar registro" : "Registrar dolor (+10 puntos)"}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 20, overflow: "hidden", elevation: 4 },
  label: { marginTop: 8, marginBottom: 12, fontWeight: "700", fontSize: 16 },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  input: { marginTop: 12 },
  button: { marginTop: 24, marginBottom: 8 },
  error: { fontSize: 12, marginTop: 6 },
  imageScroll: { marginTop: 8, marginBottom: 20 },
  imageOption: { marginRight: 16, position: "relative" },
  imagePreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedImage: { borderColor: "#9C27B0" },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(156, 39, 176, 0.8)", // Purple overlay
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#9C27B0",
  },
  checkMark: { color: "white", fontSize: 28, fontWeight: "bold" },
});

export default RecordPainScreen;
