import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Card,
  Switch,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useTheme } from "../context/ThemeContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();

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
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  card: { borderRadius: 24, overflow: "hidden" },
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
