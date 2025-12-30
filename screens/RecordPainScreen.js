import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  RadioButton,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUser } from "../context/UserContext";

const schema = yup.object({
  pain: yup.string().required("Selecciona un dolor"),
  notes: yup.string(),
});

const RecordPainScreen = ({ navigation, route }) => {
  const { user, addRecord } = useUser();
  const paperTheme = usePaperTheme();
  const [customPain, setCustomPain] = useState("");
  const { personId, personName } = route?.params || {};

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedPain = watch("pain");

  const onSubmit = (data) => {
    const normalizedPain =
      data.pain === "Otro" ? (customPain || "").trim() || "Otro" : data.pain;

    addRecord({
      personId,
      personName,
      pain: normalizedPain,
      notes: data.notes,
    });

    Alert.alert(
      "¡Registrado!",
      `Dolor registrado para ${personName}: ${normalizedPain}`
    );
    navigation.goBack();
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
        <Card.Title title="Registrar dolor" subtitle={personName} />
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
                  <View key={pain} style={styles.radioItem}>
                    <RadioButton value={pain} />
                    <Text>{pain}</Text>
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

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          >
            Registrar dolor (+10 puntos)
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  card: { borderRadius: 16, overflow: "hidden" },
  label: { marginTop: 4, marginBottom: 10, fontWeight: "700" },
  radioItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  input: { marginTop: 10 },
  button: { marginTop: 16 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordPainScreen;
