import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";
import FieldError from "../components/FieldError";
import { clearCredentials } from "../utils/biometricService";
import { useBurst } from "../components/BurstProvider";
import { DELETE_EMOJIS } from "../utils/particles";
import { confirmAction, showMessage } from "../utils/confirm";
import { validatePasswordForDeletion } from "../utils/validation";

const DeleteAccountScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, deleteAccount } = useUser();
  const fire = useBurst();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    const problem = validatePasswordForDeletion(password);
    setError(problem);
    if (problem) return;

    const confirmed = await confirmAction({
      title: "¿Eliminar tu cuenta?",
      message:
        "Se borran tu cuenta, tus personas, tus tipos de dolor y todos tus registros. No se puede deshacer.",
      confirmText: "Eliminar cuenta",
    });
    if (!confirmed) return;

    setDeleting(true);
    const result = await deleteAccount(password.trim());
    if (!result.success) {
      setDeleting(false);
      setError(result.error);
      return;
    }
    // The session is gone: the navigator is already showing the login screen.
    clearCredentials();
    fire("emojiRain", undefined, { emojis: DELETE_EMOJIS });
    showMessage("Cuenta eliminada", "Tus datos se borraron. Gracias por haber usado DailyAches.");
  };

  const counts = [
    `${user.people?.length ?? 0} personas`,
    `${user.painTypes?.length ?? 0} tipos de dolor`,
    `${user.records?.length ?? 0} registros`,
  ].join(" · ");

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="CUENTA"
        title="Eliminar tu cuenta"
        description="Es definitivo: no podremos recuperar nada después."
      />

      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" accessibilityRole="header" style={styles.title}>
            Se borrará todo esto
          </Text>
          <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>{counts}</Text>
          <Text style={[styles.note, { color: paperTheme.colors.onSurfaceVariant }]}>
            Si solo quieres un respaldo antes, exporta tu historial desde Más → Exportar historial.
          </Text>

          <AppTextField
            label="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={Boolean(error)}
            style={styles.input}
          />
          <FieldError message={error} />
          <Button
            mode="contained"
            buttonColor={paperTheme.colors.error}
            textColor={paperTheme.colors.onError}
            onPress={onDelete}
            loading={deleting}
            disabled={deleting}
            style={styles.button}
          >
            {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  card: { borderRadius: 24, overflow: "hidden" },
  title: { fontWeight: "800", marginBottom: 6 },
  note: { marginTop: 10, marginBottom: 14, lineHeight: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 12, borderRadius: 16 },
});

export default DeleteAccountScreen;
