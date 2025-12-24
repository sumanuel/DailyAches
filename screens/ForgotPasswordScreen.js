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
});

const ForgotPasswordScreen = ({ navigation }) => {
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
    alert("Email de recuperación enviado");
    navigation.goBack();
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Contraseña</Text>
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
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          Enviar Email
        </Button>
        <Button onPress={() => navigation.goBack()}>Volver</Button>
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

export default ForgotPasswordScreen;
