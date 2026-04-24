import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
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
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";

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
        navigation.getParent()?.replace("Main");
      } else {
        Alert.alert(
          "Error de inicio de sesión",
          response.error || "Credenciales inválidas",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="BIENVENIDO DE NUEVO"
        title="Tu cuerpo ya puede empezar a chismear"
        description="Entra para registrar molestias, seguir el drama del día y mantener el humor incluso cuando el cuerpo no coopera."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Iniciar Sesión
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Usa tu cuenta para volver a tu tablero con estilo.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <AppTextField
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
              <AppTextField
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
          <Button
            style={styles.linkButton}
            onPress={() => navigation.navigate("Register")}
          >
            ¿No tienes cuenta? Regístrate
          </Button>
          <Button
            style={styles.linkButton}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Olvidé mi contraseña
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: { borderRadius: 28, overflow: "hidden" },
  title: { textAlign: "center", marginBottom: 8, fontWeight: "800" },
  subtitle: { textAlign: "center", marginBottom: 18, lineHeight: 20 },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
  },
  linkButton: {
    marginTop: 4,
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
