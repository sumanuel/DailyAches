import React from "react";
import { View, StyleSheet } from "react-native";
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
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
});

const LoginScreen = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Lógica de login (llamar a API)
    console.log(data);
    // Navegar al Home si login exitoso
    // navigation.navigate('Home');
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar Sesión</Text>
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
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Iniciar Sesión
        </Button>
        <Button onPress={() => navigation.navigate("Register")}>
          ¿No tienes cuenta? Regístrate
        </Button>
        <Button onPress={() => navigation.navigate("ForgotPassword")}>
          Olvidé mi contraseña
        </Button>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default LoginScreen;
