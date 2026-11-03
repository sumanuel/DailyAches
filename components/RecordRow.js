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
        <View style={styles.titleRow}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
            {record.pain}
          </Text>
          {record.painLevel ? (
            <Text
              style={[
                styles.level,
                {
                  backgroundColor: paperTheme.colors.accentBerry,
                  color: paperTheme.colors.onSurface,
                },
              ]}
              accessibilityLabel={`Intensidad ${record.painLevel} de 10`}
            >
              {record.painLevel}/10
            </Text>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.meta, { color: paperTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        ) : null}
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontWeight: "800" },
  level: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  meta: { fontSize: 13 },
  notes: { fontSize: 13, lineHeight: 18, marginTop: 2 },
});

export default RecordRow;
