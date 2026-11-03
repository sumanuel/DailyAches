import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import ActionMenu from "./ActionMenu";
import IllustrationBadge from "./IllustrationBadge";
import { getPainIllustration } from "../constants/illustrations";

// One pain record as a row inside a card: pain type and intensity first, then
// when it happened and the notes. Edit, share and delete live in one menu so
// the row stays readable on a phone (see ActionMenu). `subtitle` is the time (or date and time)
// and `illustrationKey` picks the pain picture (see resolvePainIllustrationKey).
const RecordRow = ({
  record,
  illustrationKey,
  subtitle,
  onEdit,
  onShare,
  onDelete,
}) => {
  const paperTheme = usePaperTheme();
  const actions = [
    onEdit && { label: "Editar", icon: "square-edit-outline", onPress: onEdit },
    onShare && { label: "Compartir", icon: "share-variant-outline", onPress: onShare },
    onDelete && { label: "Eliminar", icon: "delete-outline", onPress: onDelete, destructive: true },
  ].filter(Boolean);

  return (
    <View style={styles.row}>
      <IllustrationBadge
        preset={getPainIllustration(illustrationKey)}
        size={44}
        style={styles.badge}
      />

      <View style={styles.body}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {record.pain}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: paperTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
          {record.painLevel ? (
            <Text
              style={[styles.meta, { color: paperTheme.colors.onSurfaceVariant }]}
              accessibilityLabel={`Intensidad ${record.painLevel} de 10`}
            >
              Intensidad:{" "}
              <Text style={[styles.level, { color: paperTheme.colors.onSurface }]}>
                {record.painLevel}
              </Text>
            </Text>
          ) : null}
        </View>
        {record.notes ? (
          <Text
            numberOfLines={2}
            style={[styles.notes, { color: paperTheme.colors.onSurface }]}
          >
            {record.notes}
          </Text>
        ) : null}
      </View>

      <ActionMenu title={record.pain} actions={actions} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  badge: { flexShrink: 0 },
  body: { flex: 1, gap: 2 },
  title: { fontWeight: "800" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  meta: { fontSize: 13 },
  level: { fontWeight: "800" },
  notes: { fontSize: 13, lineHeight: 18, marginTop: 2 },
});

export default RecordRow;
