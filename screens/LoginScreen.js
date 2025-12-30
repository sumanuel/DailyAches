import React from "react";
import { View, StyleSheet } from "react-native";
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
  email: yup.string().email("Email inválido"),
  password: yup.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

const LoginScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Lógica de login (simulado, sin validación)
    console.log(data);
    // Navegar al área principal sin importar las credenciales
    navigation.getParent()?.replace("Main");
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
          >
            Iniciar Sesión
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
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default LoginScreen;
