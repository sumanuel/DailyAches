import React, { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert, Share } from "react-native";
import {
  Card,
  Text,
  IconButton,
  useTheme as usePaperTheme,
  Avatar,
} from "react-native-paper";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

const avatarImages = {
  "DolorDeCabeza.png": require("../assets/avatars/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/avatars/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/avatars/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/avatars/Mujer feliz.png"),
  "Saltando.png": require("../assets/avatars/Saltando.png"),
};

const painImages = {
  "DolorDeCabeza.png": require("../assets/resourse_one/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/resourse_one/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/resourse_one/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/resourse_one/Mujer feliz.png"),
};

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

  useFocusEffect(
    useCallback(() => {
      const todayRecords = getTodayRecords();
      setDailyRecords(todayRecords);

      if (todayRecords.length === 0) {
        // Mensaje de sorpresa si no hay registros
        const randomSurprise =
          surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
        setMessage(randomSurprise);
        setImageUri(require("../assets/avatars/Saltando.png"));
      } else {
        // Mensajes dinámicos basados en registros
        const randomDefault =
          defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
        setMessage(randomDefault);
        setImageUri(require("../assets/resourse_one/DolorDeCabeza.png"));
      }
    }, [getTodayRecords, user.records])
  );

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
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes} ${ampm}`;
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
                  titleStyle={{ fontWeight: 'bold', fontSize: 18 }}
                  left={(props) => (
                    <Avatar.Image
                      size={40}
                      source={
                        avatarImages[
                          peopleById[personKey]?.avatar || "Mujer feliz.png"
                        ]
                      }
                    />
                  )}
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
                            {record.image ? (
                              <Image
                                source={painImages[record.image]}
                                style={styles.recordImage}
                              />
                            ) : null}
                            <View style={styles.painInfo}>
                              <Text
                                variant="titleMedium"
                                style={styles.painTitle}
                              >
                                {record.pain}
                              </Text>
                              {timeLabel ? (
                                <Text style={styles.timeLabel}>
                                  {timeLabel}
                                </Text>
                              ) : null}
                            </View>
                            <View style={styles.painActions}>
                              <IconButton
                                icon="pencil"
                                size={18}
                                onPress={() =>
                                  navigation.navigate("RecordPain", { record })
                                }
                                accessibilityLabel="Editar registro"
                              />
                              <IconButton
                                icon="share-variant"
                                size={18}
                                onPress={() => handleShareRecord(record)}
                                accessibilityLabel="Compartir registro"
                              />
                            </View>
                          </View>

                          {record.notes ? (
                            <Text
                              style={{
                                color: paperTheme.colors.onSurfaceVariant,
                                marginTop: 2,
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
    gap: 8,
  },
  painInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recordImage: { width: 40, height: 40, borderRadius: 20 },
  painTitle: { fontWeight: "700" },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  painActions: { flexDirection: "row" },
});

export default HomeScreen;
