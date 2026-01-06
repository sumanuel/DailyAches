import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  useTheme as usePaperTheme,
  ActivityIndicator,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthService from "../utils/authService";

const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerida"),
});

const RegisterScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await AuthService.register(
        data.email,
        data.password,
        data.name
      );

      if (response.success) {
        Alert.alert(
          "Registro exitoso",
          "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error de registro",
          response.error || "Ha ocurrido un error al crear tu cuenta.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Registro
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Nombre"
                value={value}
                onChangeText={onChange}
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.name && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.name.message}
            </Text>
          )}
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
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Contraseña"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={!!errors.password}
                style={styles.input}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.password.message}
            </Text>
          )}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Confirmar Contraseña"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={!!errors.confirmPassword}
                style={styles.input}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={[styles.error, { color: paperTheme.colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={styles.loader}
                />
                Registrando...
              </>
            ) : (
              "Registrarse"
            )}
          </Button>
          <Button onPress={() => navigation.navigate("Login")}>
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  loader: {
    marginRight: 8,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default RegisterScreen;
