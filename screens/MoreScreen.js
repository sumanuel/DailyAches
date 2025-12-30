import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, FlatList } from "react-native";
import {
  Button,
  Card,
  List,
  ProgressBar,
  Text,
  TextInput,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const MoreScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, updateProfile, getLevelProgress } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setName(user.profile?.name || "");
    setEmail(user.profile?.email || "");
  }, [user.profile?.name, user.profile?.email]);

  const onSaveProfile = () => {
    updateProfile({ name: name.trim(), email: email.trim() });
  };

  const progress = getLevelProgress();
  const progress01 =
    typeof progress.progress === "number" ? progress.progress : 0;

  const renderAchievement = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.description}
      left={(props) => (
        <List.Icon
          {...props}
          icon={item.unlocked ? "trophy" : "trophy-outline"}
          color={item.unlocked ? "#FFD700" : "#ccc"}
        />
      )}
      right={(props) => (
        <Text
          style={item.unlocked ? styles.unlockedPoints : styles.lockedPoints}
        >
          {item.points} pts
        </Text>
      )}
      style={item.unlocked ? styles.unlockedItem : styles.lockedItem}
    />
  );

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

      {/* Profile Section */}
      <Card style={styles.card}>
        <Card.Title title="Perfil" />
        <Card.Content>
          <TextInput
            label="Nombre"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.hint}>
            En modo demo, estos datos son locales.
          </Text>
          <Button
            mode="contained"
            onPress={onSaveProfile}
            style={styles.button}
          >
            Guardar
          </Button>
        </Card.Content>
      </Card>

      {/* Level Section */}
      <Card style={styles.card}>
        <Card.Title title="Nivel y puntos" />
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleMedium">Nivel {user.level}</Text>
            <Text variant="titleMedium">{user.points} pts</Text>
          </View>
          <ProgressBar progress={progress01} style={styles.progress} />
          {progress.nextLevel ? (
            <Text style={styles.sub}>
              Faltan {progress.remaining} pts para nivel {progress.nextLevel}
            </Text>
          ) : (
            <Text style={styles.sub}>Nivel máximo alcanzado</Text>
          )}
        </Card.Content>
      </Card>

      {/* Achievements Section */}
      <Card style={styles.card}>
        <Card.Title title="Logros" />
        <Card.Content>
          <Text style={styles.subtitle}>
            Desbloquea logros registrando dolores y alcanzando hitos.
          </Text>
          <FlatList
            data={user.achievements}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAchievement}
            ListEmptyComponent={<Text>No hay logros disponibles.</Text>}
            scrollEnabled={false}
          />
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <Card style={styles.card}>
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
  input: { marginBottom: 12 },
  hint: { opacity: 0.7, marginTop: 4 },
  button: { marginTop: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progress: { marginTop: 12, height: 10, borderRadius: 6 },
  sub: { marginTop: 8, opacity: 0.7 },
  subtitle: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  unlockedItem: { backgroundColor: "#e8f5e8" },
  lockedItem: { backgroundColor: "#f5f5f5" },
  unlockedPoints: { color: "#4CAF50", fontWeight: "bold" },
  lockedPoints: { color: "#ccc" },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.2 },
  footer: { textAlign: "center", marginTop: 24, opacity: 0.7 },
});

export default MoreScreen;
