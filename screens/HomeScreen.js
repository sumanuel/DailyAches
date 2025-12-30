import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Share } from "react-native";
import {
  Text,
  Button,
  Card,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const HomeScreen = ({ navigation }) => {
  const { user, unlockAchievement, getTodayRecords } = useUser();
  const paperTheme = usePaperTheme();
  const [dailyRecords, setDailyRecords] = useState([]);
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
    const todayRecords = getTodayRecords();
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
  }, [user.records]);

  const handleShareToFacebook = async () => {
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
          mode="outlined"
          onPress={handleShareToFacebook}
          style={styles.button}
        >
          Compartir en Facebook
        </Button>
      </View>

      {dailyRecords.length > 0 && (
        <>
          {Object.entries(
            dailyRecords.reduce((acc, record) => {
              if (!acc[record.personName]) acc[record.personName] = [];
              acc[record.personName].push(record);
              return acc;
            }, {})
          ).map(([personName, records]) => (
            <Card key={personName} style={styles.card}>
              <Card.Title title={`Dolores de ${personName}`} />
              <Card.Content>
                {records.map((record, index) => (
                  <Card key={index} style={styles.painCard}>
                    <Card.Content>
                      <Text>{record.pain}</Text>
                      {record.notes && (
                        <Text style={styles.notes}>{record.notes}</Text>
                      )}
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
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
    marginHorizontal: 10,
    gap: 10,
  },
  button: {
    marginVertical: 0,
  },
  painCard: {
    marginVertical: 4,
    backgroundColor: "#f5f5f5",
  },
  notes: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});

export default HomeScreen;
