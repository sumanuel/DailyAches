import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Switch, Provider as PaperProvider } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Provider as PaperProvider>
      <ScrollView style={styles.container}>
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
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
});

export default SettingsScreen;