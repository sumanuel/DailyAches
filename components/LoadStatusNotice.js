import React from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { joinLabels, summarizeSources } from "../utils/loadStatus";

// Shows a spinner while a resource loads for the first time with nothing to
// display, or a soft error card with a retry button when a load failed.
// sources: [{ status, hasData, label, onRetry }] from useUser().remoteStatus.
const LoadStatusNotice = ({ sources, style }) => {
  const paperTheme = usePaperTheme();
  const { failed, initialLoading, hasStaleData, isRetrying } =
    summarizeSources(sources);

  if (failed.length === 0 && initialLoading.length === 0) return null;

  if (failed.length === 0) {
    return (
      <View
        style={[styles.loading, style]}
        accessibilityRole="progressbar"
        accessibilityLabel="Cargando"
      >
        <ActivityIndicator size="small" color={paperTheme.colors.primary} />
        <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>
          Cargando {joinLabels(initialLoading.map((s) => s.label))}...
        </Text>
      </View>
    );
  }

  const retry = () => failed.forEach((source) => source.onRetry?.());

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: paperTheme.colors.errorContainer },
        style,
      ]}
      accessibilityRole="alert"
    >
      <Card.Content style={styles.row}>
        <Text
          style={[styles.message, { color: paperTheme.colors.onErrorContainer }]}
        >
          No se pudieron cargar {joinLabels(failed.map((s) => s.label))}.{" "}
          {hasStaleData
            ? "Se muestran los datos guardados."
            : "Revisa la conexión e inténtalo de nuevo."}
        </Text>
        <Button
          mode="text"
          compact
          onPress={retry}
          loading={isRetrying}
          disabled={isRetrying}
          textColor={paperTheme.colors.onErrorContainer}
        >
          Reintentar
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  loading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
  card: {
    borderRadius: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  message: {
    flex: 1,
  },
});

export default LoadStatusNotice;
