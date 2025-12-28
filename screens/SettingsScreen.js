import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Switch,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useTheme } from "../context/ThemeContext";

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const paperTheme = usePaperTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Configuración" />
        <Card.Content>
          <View style={styles.settingItem}>
            <Text>Modo Oscuro</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default SettingsScreen;
