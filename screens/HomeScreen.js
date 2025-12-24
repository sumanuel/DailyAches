import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  Card,
  Provider as PaperProvider,
  FAB,
} from "react-native-paper";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import { useUser } from "../context/UserContext";

const HomeScreen = ({ navigation }) => {
  const { user, unlockAchievement } = useUser();
  const { user } = useUser();
  const [dailyRecords, setDailyRecords] = useState([]); // Simular registros diarios
  const [message, setMessage] = useState("");
  const [imageUri, setImageUri] = useState("https://via.placeholder.com/300"); // Imagen dinámica placeholder

  const defaultMessages = [
    "¡Hola! ¿Cómo van esos dolores hoy? 😏",
    "Recuerda registrar tus dolores para ganar puntos y logros!",
    "¡Un día sin dolor es un día ganado! Comparte tu victoria.",
    "No olvides agregar a quién le duele... ¡con humor!",
  ];

  const surpriseMessages = [
    "¡Sorpresa! No registraste ningún dolor hoy. ¿Estás bien? 😂",
    "¡Día perfecto! Sin dolores reportados. ¡Felicidades!",
  ];

  useEffect(() => {
    // Simular carga de registros diarios (desde API o storage)
    // Por ahora, vacío para mostrar mensajes por defecto
    const todayRecords = []; // Simular que no hay registros
    setDailyRecords(todayRecords);

    if (todayRecords.length === 0) {
      // Mensaje de sorpresa si no hay registros
      const randomSurprise =
        surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
      setMessage(randomSurprise);
      setImageUri("https://via.placeholder.com/300?text=Sin+Dolores"); // Imagen de celebración
    } else {
      // Mensajes dinámicos basados en registros
      const randomDefault =
        defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      setMessage(randomDefault);
      setImageUri("https://via.placeholder.com/300?text=Dolores+Registrados"); // Imagen relacionada
    }
  }, []);

  const handleAddRecord = () => {
    navigation.navigate("RecordPain"); // Navegar a pantalla de registro de dolores
  };

  const handleViewStats = () => {
    navigation.navigate("Stats"); // Navegar a estadísticas
  };

  const handleViewAchievements = () => {
    navigation.navigate("Achievements"); // Navegar a logros
  };

  const handleViewInfo = () => {
    navigation.navigate("Info"); // Navegar a información
  };
  const handleViewSettings = () => {
    navigation.navigate("Settings"); // Navegar a configuración
  };
  const handleShareToFacebook = async () => {
    const hasRecords = dailyRecords.length > 0;
    const shareMessage = hasRecords
      ? `¡Registré dolores hoy en DailyAches! Nivel ${user.level}, ${user.points} puntos. #DailyAches`
      : `¡Día perfecto! Sin dolores reportados hoy. #DailyAches`;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(null, {
          dialogTitle: "Compartir en Facebook",
          UTI: "public.plain-text", // Para texto
        });
        // Nota: Sharing.shareAsync no permite especificar Facebook directamente, pero el usuario puede elegir Facebook en el diálogo.
        // Para Facebook específico, necesitarías Facebook SDK, pero esto es un placeholder.
        Alert.alert(
          "¡Compartido!",
          "Mensaje preparado para compartir en Facebook."
        );
        // Desbloquear logro de compartir
        unlockAchievement(5); // ID del logro "Compartidor"
      } else {
        Alert.alert(
          "Error",
          "Compartir no está disponible en este dispositivo."
        );
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "No se pudo compartir.");
    }
  };
  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>¡Bienvenido a DailyAches!</Text>
            <Text style={styles.level}>
              Nivel: {user.level} | Puntos: {user.points}
            </Text>
            <Text style={styles.message}>{message}</Text>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              placeholder={require("../assets/splash-icon.png")} // Placeholder local si existe
              contentFit="cover"
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleAddRecord}
            style={styles.button}
          >
            Registrar Dolor
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewStats}
            style={styles.button}
          >
            Ver Estadísticas
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewAchievements}
            style={styles.button}
          >
            Ver Logros
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewInfo}
            style={styles.button}
          >
            Información
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewSettings}
            style={styles.button}
          >
            Configuración
          </Button>
          <Button
            mode="outlined"
            onPress={handleShareToFacebook}
            style={styles.button}
          >
            Compartir en Facebook
          </Button>
        </View>

        {dailyRecords.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Registros de Hoy" />
            <Card.Content>
              {dailyRecords.map((record, index) => (
                <Text key={index}>
                  - {record.pain} para {record.person}
                </Text>
              ))}
            </Card.Content>
          </Card>
        )}

        <FAB icon="plus" style={styles.fab} onPress={handleAddRecord} />
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  level: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 10,
    flexWrap: "wrap",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
