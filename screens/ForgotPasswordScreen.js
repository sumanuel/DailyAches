import React from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

// There is no password recovery yet: the API has no endpoint for it (it needs
// an email service). Until it does, this screen says so instead of pretending
// to send an email.
const ForgotPasswordScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="RECUPERAR CUENTA"
        title="Aún no podemos enviarte un correo"
        description="La recuperación de contraseña todavía no está disponible, así que por ahora no hay forma de restablecerla desde la app."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <Text
            variant="titleMedium"
            accessibilityRole="header"
            style={styles.title}
          >
            Mientras tanto
          </Text>
          <Text style={[styles.text, { color: paperTheme.colors.onSurfaceVariant }]}>
            Prueba de nuevo con las contraseñas que sueles usar. Cuando la
            recuperación esté lista, la encontrarás en esta misma pantalla.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Volver al inicio de sesión
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center" },
  card: { borderRadius: 28, overflow: "hidden" },
  title: { fontWeight: "800", marginBottom: 8 },
  text: { lineHeight: 22 },
  button: { marginTop: 20, borderRadius: 16 },
});

export default ForgotPasswordScreen;
