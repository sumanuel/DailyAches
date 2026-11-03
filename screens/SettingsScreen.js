import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  Button,
  Text,
  Card,
  Switch,
  useTheme as usePaperTheme,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import FieldError from "../components/FieldError";
import {
  clearCredentials,
  getSavedEmail,
  isBiometricSupported,
} from "../utils/biometricService";
import {
  applyReminder,
  isReminderSupported,
  loadReminder,
} from "../utils/reminderService";
import {
  DEFAULT_REMINDER,
  dateToReminder,
  describeReminder,
  formatReminderTime,
  reminderToDate,
} from "../utils/reminders";

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();
  const reminderSupported = isReminderSupported();
  const [reminder, setReminder] = useState(DEFAULT_REMINDER);
  const [showPicker, setShowPicker] = useState(false);
  const [reminderError, setReminderError] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [savedEmail, setSavedEmail] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([isBiometricSupported(), getSavedEmail()]).then(
      ([canUse, email]) => {
        if (!active) return;
        setBiometricSupported(canUse);
        setSavedEmail(email);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const turnOffBiometric = async () => {
    await clearCredentials();
    setSavedEmail(null);
  };

  useEffect(() => {
    loadReminder().then(setReminder);
  }, []);

  const updateReminder = async (next) => {
    setSavingReminder(true);
    setReminderError("");
    const result = await applyReminder(next);
    // Re-read what was saved: a denied permission leaves the reminder off.
    setReminder(await loadReminder());
    if (!result.success) setReminderError(result.error);
    setSavingReminder(false);
  };

  const onTimeChange = (event, selected) => {
    setShowPicker(Platform.OS === "ios");
    if (selected) updateReminder(dateToReminder(selected, reminder));
  };

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        compact
        eyebrow="PREFERENCIAS"
        title="Ajusta la vibra de la app"
        description="No hay cientos de opciones, solo las necesarias para que la experiencia se sienta tuya y no una plantilla cualquiera."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.settingItem}>
            <View style={styles.settingCopy}>
              <Text variant="titleMedium">Modo Oscuro</Text>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
                Para cuando el cuerpo molesta y la retina pide menos intensidad.
              </Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        </Card.Content>
      </Card>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <View style={styles.settingItem}>
            <View style={styles.settingCopy}>
              <Text variant="titleMedium">Recordatorio diario</Text>
              <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
                {reminderSupported
                  ? describeReminder(reminder)
                  : "No disponible en Expo Go ni en el navegador: funciona en la app instalada."}
              </Text>
            </View>
            <Switch
              value={reminder.enabled}
              disabled={!reminderSupported || savingReminder}
              onValueChange={(enabled) =>
                updateReminder({ ...reminder, enabled })
              }
              accessibilityLabel="Recordatorio diario"
            />
          </View>

          {reminder.enabled ? (
            <Button
              mode="outlined"
              icon="clock-outline"
              onPress={() => setShowPicker(true)}
              disabled={savingReminder}
              style={styles.timeButton}
            >
              Hora: {formatReminderTime(reminder)}
            </Button>
          ) : null}
          {showPicker ? (
            <DateTimePicker
              value={reminderToDate(reminder)}
              mode="time"
              is24Hour={false}
              onChange={onTimeChange}
            />
          ) : null}
          <FieldError message={reminderError} />
        </Card.Content>
      </Card>

      {biometricSupported ? (
        <Card
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleMedium">Entrar con huella</Text>
            {savedEmail ? (
              <>
                <Text
                  style={[
                    styles.biometricText,
                    { color: paperTheme.colors.onSurfaceVariant },
                  ]}
                >
                  Activada para {savedEmail}. Al abrir la app podrás entrar con
                  tu huella en lugar de escribir la contraseña.
                </Text>
                <Button
                  mode="outlined"
                  icon="fingerprint-off"
                  onPress={turnOffBiometric}
                  style={styles.timeButton}
                >
                  Desactivar
                </Button>
              </>
            ) : (
              <Text
                style={[
                  styles.biometricText,
                  { color: paperTheme.colors.onSurfaceVariant },
                ]}
              >
                Está desactivada. Para activarla, cierra sesión y marca «Entrar
                con huella la próxima vez» al iniciar sesión.
              </Text>
            )}
          </Card.Content>
        </Card>
      ) : null}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  card: { borderRadius: 24, overflow: "hidden", marginBottom: 12 },
  timeButton: { marginTop: 12 },
  biometricText: { marginTop: 6, lineHeight: 20 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    gap: 16,
  },
  settingCopy: { flex: 1, gap: 4 },
});

export default SettingsScreen;
