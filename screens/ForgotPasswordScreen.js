import React from "react";
import { View, StyleSheet, Alert } from "react-native";
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

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email es requerido"),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Lógica para enviar email de recuperación
    console.log(data);
    // Mostrar mensaje de éxito y navegar de vuelta
    Alert.alert("Listo", "Email de recuperación enviado");
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Recuperar Contraseña
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.email.message}
            </Text>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          >
            Enviar Email
          </Button>
          <Button onPress={() => navigation.goBack()}>Volver</Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 12,
  },
  card: { borderRadius: 16, overflow: "hidden" },
  title: { textAlign: "center", marginBottom: 16 },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 12,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
