import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const HomeScreen = () => {
  const { user, getTodayRecords } = useUser();
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

  const groupedByPerson = useMemo(() => {
    return Object.entries(
      dailyRecords.reduce((acc, record) => {
        if (!acc[record.personName]) acc[record.personName] = [];
        acc[record.personName].push(record);
        return acc;
      }, {})
    );
  }, [dailyRecords]);

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
          <Text variant="titleLarge" style={styles.title}>
            ¡Bienvenido a DailyAches!
          </Text>
          <Text
            style={[
              styles.level,
              { color: paperTheme.colors.onSurfaceVariant },
            ]}
          >
            Nivel: {user.level} | Puntos: {user.points}
          </Text>
          <Text variant="titleMedium" style={styles.message}>
            {message}
          </Text>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            placeholder={require("../assets/splash-icon.png")} // Placeholder local si existe
            contentFit="cover"
          />
        </Card.Content>
      </Card>

      {dailyRecords.length > 0 && (
        <View style={styles.section}>
          {groupedByPerson.map(([personName, records]) => (
            <Card key={personName} style={styles.card}>
              <Card.Title title={`Dolores de ${personName}`} />
              <Card.Content>
                {records.map((record, index) => (
                  <Card
                    key={record.id || index}
                    style={[
                      styles.painCard,
                      { backgroundColor: paperTheme.colors.surfaceVariant },
                    ]}
                  >
                    <Card.Content>
                      <Text variant="titleMedium">{record.pain}</Text>
                      {record.notes ? (
                        <Text
                          style={{
                            color: paperTheme.colors.onSurfaceVariant,
                            marginTop: 4,
                          }}
                        >
                          {record.notes}
                        </Text>
                      ) : null}
                    </Card.Content>
                  </Card>
                ))}
              </Card.Content>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },
  section: { marginTop: 2 },
  card: { borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  title: { textAlign: "center" },
  level: { textAlign: "center", marginTop: 6, fontWeight: "700" },
  message: { textAlign: "center", marginTop: 10 },
  image: { width: "100%", height: 200, borderRadius: 14, marginTop: 12 },
  painCard: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
});

export default HomeScreen;
