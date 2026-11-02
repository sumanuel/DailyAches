import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";
import FieldError from "../components/FieldError";
import { showMessage } from "../utils/confirm";
import { validatePasswordChange } from "../utils/validation";

const ChangePasswordScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { changePassword } = useUser();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const found = validatePasswordChange({ current, next, confirm });
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    const result = await changePassword(current.trim(), next.trim());
    setSaving(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    showMessage(
      "Contraseña actualizada",
      "Cerramos tu sesión en los demás dispositivos. Aquí sigues dentro.",
    );
    navigation.goBack();
  };

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="SEGURIDAD"
        title="Cambiar tu contraseña"
        description="Al cambiarla, la sesión se cierra en tus otros dispositivos."
      />

      <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
        <Card.Content>
          <AppTextField
            label="Contraseña actual"
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            error={Boolean(errors.current)}
            style={styles.input}
          />
          <FieldError message={errors.current} />
          <AppTextField
            label="Contraseña nueva"
            value={next}
            onChangeText={setNext}
            secureTextEntry
            error={Boolean(errors.next)}
            style={styles.input}
          />
          <FieldError message={errors.next} />
          <AppTextField
            label="Repite la contraseña nueva"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            error={Boolean(errors.confirm)}
            style={styles.input}
          />
          <FieldError message={errors.confirm} />
          <FieldError message={formError} />
          <Text
            variant="bodySmall"
            style={[styles.hint, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Mínimo 6 caracteres.
          </Text>
          <Button
            mode="contained"
            onPress={onSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
          >
            {saving ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  card: { borderRadius: 24, overflow: "hidden" },
  input: { marginBottom: 10 },
  hint: { marginTop: 4 },
  button: { marginTop: 16, borderRadius: 16 },
});

export default ChangePasswordScreen;
