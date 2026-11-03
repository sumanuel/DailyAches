import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Text,
  Card,
  Switch,
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
import FieldError from "../components/FieldError";
import { showMessage } from "../utils/confirm";
import {
  clearCredentials,
  getSavedEmail,
  isBiometricSupported,
  readCredentials,
  saveCredentials,
} from "../utils/biometricService";

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Escribe tu correo.")
    .email("Escribe un correo válido."),
  password: yup.string().required("Escribe tu contraseña."),
});

const LoginScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { login } = useUser();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  // Fingerprint login: whether the phone can, which account is saved, and the
  // "next time" switch for an account that is not saved yet.
  const [supported, setSupported] = useState(false);
  const [savedEmail, setSavedEmail] = useState(null);
  const [remember, setRemember] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([isBiometricSupported(), getSavedEmail()]).then(
      ([canUse, email]) => {
        if (!active) return;
        setSupported(canUse);
        setSavedEmail(canUse ? email : null);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");
    try {
      const response = await login(data.email, data.password);

      // On success the navigator switches to the app by itself (isAuthenticated).
      if (!response.success) {
        setFormError(response.error || "No se pudo iniciar sesión.");
      } else if (remember && supported && !savedEmail) {
        // The login screen goes away now, so a failure is told with a dialog.
        saveCredentials(data.email.trim(), data.password).then((saved) => {
          if (!saved.success && saved.error) showMessage("Huella", saved.error);
        });
      }
    } catch {
      setFormError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const onBiometric = async () => {
    setBiometricLoading(true);
    setFormError("");
    try {
      const saved = await readCredentials();
      if (!saved.success) {
        if (saved.error) setFormError(saved.error);
        setSavedEmail(await getSavedEmail());
        return;
      }
      const response = await login(
        saved.credentials.email,
        saved.credentials.password,
      );
      if (response.success) return;
      if (response.status === 401) {
        // The password changed somewhere else: what is saved is useless now.
        await clearCredentials();
        setSavedEmail(null);
        setFormError(
          "La contraseña guardada ya no es válida. Entra con tu contraseña y vuelve a activar la huella.",
        );
      } else {
        setFormError(response.error || "No se pudo iniciar sesión.");
      }
    } catch {
      setFormError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="BIENVENIDO DE NUEVO"
        title="Ya puede retomarse el radar de achaques"
        description="Entra para registrar molestias de otras personas, revisar el seguimiento del día y mantener el tono ligero mientras se acompaña cada episodio."
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
            Usa la cuenta para volver al tablero de seguimiento.
          </Text>

          {savedEmail ? (
            <>
              <Button
                mode="contained-tonal"
                icon="fingerprint"
                onPress={onBiometric}
                loading={biometricLoading}
                disabled={biometricLoading || loading}
                style={styles.biometric}
                contentStyle={styles.biometricContent}
                accessibilityLabel={`Entrar con huella como ${savedEmail}`}
              >
                Entrar con huella
              </Button>
              <Text
                style={[
                  styles.biometricAccount,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                {savedEmail}
              </Text>
              <Text
                style={[
                  styles.orDivider,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                o con tu contraseña
              </Text>
            </>
          ) : null}

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

          {supported && !savedEmail ? (
            <View style={styles.rememberRow}>
              <Text style={styles.rememberText}>
                Entrar con huella la próxima vez
              </Text>
              <Switch
                value={remember}
                onValueChange={setRemember}
                accessibilityLabel="Entrar con huella la próxima vez"
              />
            </View>
          ) : null}

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
  biometric: { borderRadius: 16 },
  biometricContent: { minHeight: 48 },
  biometricAccount: { textAlign: "center", marginTop: 6, fontSize: 13 },
  orDivider: { textAlign: "center", marginTop: 14, marginBottom: 14, fontSize: 13 },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  rememberText: { flex: 1 },
  loader: {
    marginRight: 8,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginScreen;
