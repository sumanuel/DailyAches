import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
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
import { useUser } from "../context/UserContext";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email es requerido"),
  password: yup
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
});

const LoginScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { login } = useUser();
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
      const response = await login(data.email, data.password);

      if (response.success) {
        // Login successful - navigate to main app
        navigation.getParent()?.replace("Main");
      } else {
        // Show error message
        Alert.alert(
          "Error de inicio de sesión",
          response.error || "Credenciales inválidas",
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
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Iniciar Sesión
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
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
          <Button onPress={() => navigation.navigate("Register")}>
            ¿No tienes cuenta? Regístrate
          </Button>
          <Button onPress={() => navigation.navigate("ForgotPassword")}>
            Olvidé mi contraseña
          </Button>
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
  loader: {
    marginRight: 8,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginScreen;
