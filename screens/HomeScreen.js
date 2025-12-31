import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, ScrollView, Alert, Share } from "react-native";
import {
  Card,
  Text,
  IconButton,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const HomeScreen = () => {
  const { user, getTodayRecords, unlockAchievement } = useUser();
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
      setImageUri(require("../assets/resourse_one/Mujer feliz.png"));
    } else {
      // Mensajes dinámicos basados en registros
      const randomDefault =
        defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
      setMessage(randomDefault);
      setImageUri(require("../assets/resourse_one/DolorDeCabeza.png"));
    }
  }, [user.records]);

  const peopleById = useMemo(() => {
    const map = {};
    for (const p of user.people || []) {
      if (p?.id) map[p.id] = p;
    }
    return map;
  }, [user.people]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const handleShareRecord = async (record) => {
    const person = peopleById[record.personId];
    const relationship = person?.relationship
      ? ` (${person.relationship})`
      : "";
    const when = record.createdAt ? formatTime(record.createdAt) : "";
    const notesPart = record.notes ? `\nNotas: ${record.notes}` : "";
    const message = `Registro en DailyAches${when ? ` (${when})` : ""}:\n${
      record.personName
    }${relationship}\nDolor: ${record.pain}${notesPart}\n#DailyAches`;

    try {
      await Share.share({ message });
      Alert.alert("¡Listo!", "Se abrió el panel para compartir.");
      unlockAchievement(5);
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "No se pudo compartir.");
    }
  };

  const groupedByPerson = useMemo(() => {
    return Object.entries(
      dailyRecords.reduce((acc, record) => {
        const key = record.personId || record.personName || "(Sin persona)";
        if (!acc[key])
          acc[key] = { personName: record.personName, records: [] };
        acc[key].records.push(record);
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
            source={imageUri}
            style={styles.image}
            placeholder={require("../assets/splash-icon.png")} // Placeholder local si existe
            contentFit="contain"
          />
        </Card.Content>
      </Card>

      {dailyRecords.length > 0 && (
        <View style={styles.section}>
          {groupedByPerson.map(([personKey, group]) => {
            const relationship = peopleById[personKey]?.relationship;
            return (
              <Card key={personKey} style={styles.card}>
                <Card.Title
                  title={group.personName}
                  subtitle={relationship || undefined}
                />
                <Card.Content>
                  {group.records.map((record, index) => {
                    const relationship =
                      peopleById[record.personId]?.relationship || "Otro";
                    const timeLabel = record.createdAt
                      ? formatTime(record.createdAt)
                      : "";

                    return (
                      <Card
                        key={record.id || index}
                        style={[
                          styles.painCard,
                          { backgroundColor: paperTheme.colors.surfaceVariant },
                        ]}
                      >
                        <Card.Content>
                          <View style={styles.painHeader}>
                            <Text
                              variant="titleMedium"
                              style={styles.painTitle}
                            >
                              {record.pain}
                            </Text>
                            <IconButton
                              icon="share-variant"
                              size={18}
                              onPress={() => handleShareRecord(record)}
                              accessibilityLabel="Compartir registro"
                            />
                          </View>

                          <Text
                            style={{
                              color: paperTheme.colors.onSurfaceVariant,
                              marginTop: 2,
                            }}
                          >
                            {relationship}
                            {timeLabel ? ` • ${timeLabel}` : ""}
                          </Text>

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
                    );
                  })}
                </Card.Content>
              </Card>
            );
          })}
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
  painHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  painTitle: { flex: 1, fontWeight: "700" },
});

export default HomeScreen;
