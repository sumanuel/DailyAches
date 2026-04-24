import React from "react";
import { StyleSheet, View, Alert, Share } from "react-native";
import {
  Card,
  List,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";

const MoreScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, unlockAchievement, getTodayRecords } = useUser();
  const todayCount = getTodayRecords().length;

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
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow="CENTRO DE CONTROL"
        title="Mas cosas que hacer cuando el cuerpo anda creativo"
        description="Ajusta tu cuenta, revisa tu progreso o comparte el resumen del dia con el drama justo y la elegancia suficiente."
      >
        <View style={styles.heroStats}>
          <Text
            style={[
              styles.heroChip,
              {
                backgroundColor: paperTheme.colors.accentSky,
                color: paperTheme.colors.onSurface,
              },
            ]}
          >
            Nivel {user.level}
          </Text>
          <Text
            style={[
              styles.heroChip,
              {
                backgroundColor: paperTheme.colors.accentMint,
                color: paperTheme.colors.onSurface,
              },
            ]}
          >
            Hoy: {todayCount} registro{todayCount === 1 ? "" : "s"}
          </Text>
        </View>
      </HeroPanel>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <List.Item
          title="Progreso"
          description="Logros, nivel y puntos acumulados"
          left={(props) => <List.Icon {...props} icon="chart-line-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Progress")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Perfil"
          description="Tus datos principales y ajustes personales"
          left={(props) => <List.Icon {...props} icon="account-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Profile")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Configuración"
          description="Tema y preferencias generales"
          left={(props) => <List.Icon {...props} icon="cog-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Settings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Configurar dolores"
          description="Edita el catalogo de molestias disponibles"
          left={(props) => <List.Icon {...props} icon="format-list-bulleted" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("PainSettings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Compartir en Facebook"
          description="Saca pecho si hoy hubo valentia o paz"
          left={(props) => <List.Icon {...props} icon="facebook" />}
          onPress={handleShareToFacebook}
        />
      </Card>

      <Text style={styles.footer}>DailyAches</Text>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  card: { marginBottom: 16, borderRadius: 24, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.2 },
  footer: { textAlign: "center", marginTop: 24, opacity: 0.7 },
});

export default MoreScreen;
