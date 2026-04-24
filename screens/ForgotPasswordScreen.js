import React from "react";
import { StyleSheet, Alert } from "react-native";
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
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

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
    console.log(data);
    Alert.alert("Listo", "Email de recuperación enviado");
    navigation.goBack();
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="PLAN DE RESCATE"
        title="Vamos a traerte de vuelta"
        description="Escribe tu correo y te mandamos la ruta de escape para recuperar la cuenta sin mas melodrama del necesario."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Recuperar Contraseña
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Solo necesitamos tu email para empezar.
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
                mode="outlined"
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
          <Button style={styles.linkButton} onPress={() => navigation.goBack()}>
            Volver
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
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
