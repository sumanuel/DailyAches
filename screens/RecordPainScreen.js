import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Provider as PaperProvider,
  RadioButton,
  FAB,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUser } from "../context/UserContext";

const schema = yup.object({
  pain: yup.string().required("Selecciona un dolor"),
  person: yup.string().required("Selecciona a quién le duele"),
  notes: yup.string(),
});

const defaultPains = [
  "Dolor de cabeza",
  "Dolor de espalda",
  "Dolor menstrual",
  "Dolor de estómago",
  "Dolor de garganta",
  "Dolor de dientes",
  "Otro",
];

const persons = ["Esposa", "Novia", "Hermana", "Madre", "Otra"];

const RecordPainScreen = ({ navigation }) => {
  const { incrementRecords, addPoints } = useUser();
  const [customPain, setCustomPain] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const selectedPain = watch("pain");

  const onSubmit = (data) => {
    // Lógica para guardar el registro (API o storage)
    console.log(data);
    // Incrementar contador de registros y dar puntos
    incrementRecords();
    addPoints(10); // 10 puntos por registro
    Alert.alert(
      "¡Registrado!",
      `Dolor registrado para ${data.person}: ${data.pain}`
    );
    navigation.goBack();
  };

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Registrar Dolor" />
          <Card.Content>
            <Text style={styles.label}>Selecciona el dolor:</Text>
            <Controller
              control={control}
              name="pain"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={onChange} value={value}>
                  {defaultPains.map((pain) => (
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
              <Text style={styles.error}>{errors.pain.message}</Text>
            )}

            <Text style={styles.label}>¿A quién le duele?</Text>
            <Controller
              control={control}
              name="person"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={onChange} value={value}>
                  {persons.map((person) => (
                    <View key={person} style={styles.radioItem}>
                      <RadioButton value={person} />
                      <Text>{person}</Text>
                    </View>
                  ))}
                </RadioButton.Group>
              )}
            />
            {errors.person && (
              <Text style={styles.error}>{errors.person.message}</Text>
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
              Registrar Dolor (+10 puntos)
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});

export default RecordPainScreen;
