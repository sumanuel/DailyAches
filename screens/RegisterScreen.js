import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Provider as PaperProvider,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Lógica de registro (llamar a API)
    console.log(data);
    // Navegar al Login si registro exitoso
    navigation.navigate("Login");
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro</Text>
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
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
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
          <Text style={styles.error}>{errors.email.message}</Text>
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
          <Text style={styles.error}>{errors.password.message}</Text>
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
          <Text style={styles.error}>{errors.confirmPassword.message}</Text>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Registrarse
        </Button>
        <Button onPress={() => navigation.navigate("Login")}>
          ¿Ya tienes cuenta? Inicia Sesión
        </Button>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});

export default RegisterScreen;
