import React from "react";
import { StyleSheet, View, ScrollView, Alert, Share } from "react-native";
import {
  Card,
  List,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const MoreScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, unlockAchievement, getTodayRecords } = useUser();

  const handleShareToFacebook = async () => {
    const dailyRecords = getTodayRecords();
    const hasRecords = dailyRecords.length > 0;
    const shareMessage = hasRecords
      ? `¡Registré dolores hoy en DailyAches! Nivel ${user.level}, ${user.points} puntos. #DailyAches`
      : `¡Día perfecto! Sin dolores reportados hoy. #DailyAches`;

    try {
      await Share.share({
        message: shareMessage,
      });

      Alert.alert("¡Listo!", "Se abrió el panel para compartir.");
      unlockAchievement(5); // ID del logro "Compartidor"
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "No se pudo compartir.");
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={styles.title}>
        Más opciones
      </Text>

      {/* Settings Section */}
      <Card style={styles.card}>
        <List.Item
          title="Progreso"
          left={(props) => <List.Icon {...props} icon="chart-line-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Progress")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Perfil"
          left={(props) => <List.Icon {...props} icon="account-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Profile")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Configuración"
          left={(props) => <List.Icon {...props} icon="cog-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Settings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Configurar dolores"
          left={(props) => <List.Icon {...props} icon="format-list-bulleted" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("PainSettings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Compartir en Facebook"
          left={(props) => <List.Icon {...props} icon="facebook" />}
          onPress={handleShareToFacebook}
        />
      </Card>

      <Text style={styles.footer}>DailyAches</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  title: { marginBottom: 12 },
  card: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.2 },
  footer: { textAlign: "center", marginTop: 24, opacity: 0.7 },
});

export default MoreScreen;
