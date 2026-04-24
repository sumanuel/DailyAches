import React from "react";
import { StyleSheet, View, Alert, Share } from "react-native";
import {
  Button,
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
  const { user, unlockAchievement, getTodayRecords, logout } = useUser();
  const todayCount = getTodayRecords().length;

  const handleShareToFacebook = async () => {
    const dailyRecords = getTodayRecords();
    const hasRecords = dailyRecords.length > 0;
    const shareMessage = hasRecords
      ? `Hoy se registraron achaques en DailyAches. Nivel ${user.level}, ${user.points} puntos. #DailyAches`
      : `Hoy no se registraron achaques en DailyAches. #DailyAches`;

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

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Deseas cerrar la sesión actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <AppScreen contentContainerStyle={styles.content}>
      <HeroPanel
        eyebrow="CENTRO DE CONTROL"
        title="Ajustes, progreso y salida rápida"
        description="Desde aquí se revisa el progreso general, se ordenan los ajustes y se resuelven las acciones más útiles sin dar rodeos."
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

      <View style={styles.statsPanel}>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: paperTheme.colors.primaryContainer },
          ]}
        >
          <Card.Content>
            <Text
              style={[
                styles.statKicker,
                { color: paperTheme.colors.onPrimaryContainer },
              ]}
            >
              PUNTOS
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {user.points}
            </Text>
            <Text
              style={[
                styles.statCopy,
                { color: paperTheme.colors.onPrimaryContainer },
              ]}
            >
              Acumulados por registros y logros
            </Text>
          </Card.Content>
        </Card>
        <Card
          style={[
            styles.statCard,
            { backgroundColor: paperTheme.colors.secondaryContainer },
          ]}
        >
          <Card.Content>
            <Text
              style={[
                styles.statKicker,
                { color: paperTheme.colors.onSecondaryContainer },
              ]}
            >
              HOY
            </Text>
            <Text variant="headlineSmall" style={styles.statValue}>
              {todayCount}
            </Text>
            <Text
              style={[
                styles.statCopy,
                { color: paperTheme.colors.onSecondaryContainer },
              ]}
            >
              Achaques registrados en el dia
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Text
        style={[
          styles.sectionLabel,
          { color: paperTheme.colors.onSurfaceVariant },
        ]}
      >
        PANEL PRINCIPAL
      </Text>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <List.Item
          title="Progreso"
          description="Logros, nivel y puntos acumulados"
          left={(props) => <List.Icon {...props} icon="chart-arc" />}
          right={(props) => <List.Icon {...props} icon="arrow-right" />}
          onPress={() => navigation.navigate("Progress")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Perfil"
          description="Datos principales y ajustes personales"
          left={(props) => (
            <List.Icon {...props} icon="badge-account-outline" />
          )}
          right={(props) => <List.Icon {...props} icon="arrow-right" />}
          onPress={() => navigation.navigate("Profile")}
        />
      </Card>

      <Text
        style={[
          styles.sectionLabel,
          { color: paperTheme.colors.onSurfaceVariant },
        ]}
      >
        HERRAMIENTAS
      </Text>

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <List.Item
          title="Configuración"
          description="Tema y preferencias generales"
          left={(props) => <List.Icon {...props} icon="tune-variant" />}
          right={(props) => <List.Icon {...props} icon="arrow-right" />}
          onPress={() => navigation.navigate("Settings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Configurar dolores"
          description="Editar el catalogo de molestias disponibles"
          left={(props) => (
            <List.Icon {...props} icon="clipboard-list-outline" />
          )}
          right={(props) => <List.Icon {...props} icon="arrow-right" />}
          onPress={() => navigation.navigate("PainSettings")}
        />
        <View style={styles.divider} />
        <List.Item
          title="Compartir en Facebook"
          description="Compartir un resumen del dia"
          left={(props) => <List.Icon {...props} icon="facebook" />}
          right={(props) => (
            <List.Icon {...props} icon="share-variant-outline" />
          )}
          onPress={handleShareToFacebook}
        />
      </Card>

      <Card
        style={[
          styles.logoutCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <Card.Content>
          <Text variant="titleMedium" style={styles.logoutTitle}>
            Sesión
          </Text>
          <Text
            style={[
              styles.logoutText,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Cuando ya no haga falta seguir registrando desde esta cuenta, aquí
            puede cerrarse la sesión.
          </Text>
          <Button
            mode="outlined"
            icon="logout"
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            onPress={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.footer}>DailyAches</Text>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 36 },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heroChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  statsPanel: { flexDirection: "row", gap: 12, marginBottom: 18 },
  statCard: { flex: 1, borderRadius: 24, overflow: "hidden" },
  statKicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  statValue: { fontWeight: "900", marginBottom: 4 },
  statCopy: { lineHeight: 18 },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  card: { marginBottom: 16, borderRadius: 24, overflow: "hidden" },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.2 },
  logoutCard: { borderRadius: 24, overflow: "hidden" },
  logoutTitle: { marginBottom: 6, fontWeight: "800" },
  logoutText: { lineHeight: 20 },
  logoutButton: { marginTop: 16, borderRadius: 16 },
  logoutButtonContent: { minHeight: 44 },
  footer: { textAlign: "center", marginTop: 24, opacity: 0.7 },
});

export default MoreScreen;
