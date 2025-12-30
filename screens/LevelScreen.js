import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  ProgressBar,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const LevelScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, getLevelProgress } = useUser();

  const progress = getLevelProgress();
  const progress01 =
    typeof progress.progress === "number" ? progress.progress : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progress: { marginTop: 12, height: 10, borderRadius: 6 },
  sub: { marginTop: 8, opacity: 0.7 },
});

export default LevelScreen;
