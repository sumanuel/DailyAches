import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import {
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
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";
import FieldError from "../components/FieldError";

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Escribe tu nombre.")
    .max(60, "El nombre no puede pasar de 60 caracteres."),
  email: yup
    .string()
    .trim()
    .required("Escribe tu correo.")
    .email("Escribe un correo válido."),
  password: yup
    .string()
    .required("Escribe una contraseña.")
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  confirmPassword: yup
    .string()
    .required("Repite la contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
});

const RegisterScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");
    try {
      const response = await AuthService.register(
        data.email,
        data.password,
        data.name,
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
          ],
        );
      } else {
        setFormError(response.error || "No se pudo crear la cuenta.");
      }
    } catch {
      setFormError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="NUEVA CUENTA"
        title="Crea tu club oficial de achaques"
        description="Prepara tu espacio para registrar dolores con un tono ligero, seguir avances y no perderte ningún episodio del cuerpo."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Registro
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Con unos datos basicos quedas listo para empezar.
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <AppTextField
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <AppTextField
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

          <FieldError message={formError} />
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
          <Button
            style={styles.linkButton}
            onPress={() => navigation.navigate("Login")}
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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

export default RegisterScreen;
