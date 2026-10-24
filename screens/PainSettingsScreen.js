import React, { useMemo, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Card,
  FAB,
  IconButton,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { confirmAction, showMessage } from "../utils/confirm";
import { countRecordsFor, describeRecordCount } from "../utils/recordFilters";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";
import LoadStatusNotice from "../components/LoadStatusNotice";

const keyExtractor = (item) => String(item.id ?? item.name);

const PainSettingsScreen = () => {
  const paperTheme = usePaperTheme();
  const navigation = useNavigation();
  const { user, removePainType, loadPainTypesFromAPI, remoteStatus } =
    useUser();

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  useEffect(() => {
    loadPainTypesFromAPI();
  }, [loadPainTypesFromAPI]);

  const openAddScreen = () => {
    navigation.navigate("AddPainType", { isEdit: false });
  };

  const openEditScreen = (pain) => {
    navigation.navigate("AddPainType", { isEdit: true, pain });
  };

  const handleDeletePainType = async (painType) => {
    // The API does not allow deleting a type that records still use.
    const recordCount = countRecordsFor(user.records, {
      painTypeId: painType.id,
    });
    if (recordCount > 0) {
      showMessage(
        "No se puede eliminar",
        `"${painType.name}" se usa en ${describeRecordCount(
          recordCount,
        )}. Cambia o elimina esos registros y vuelve a intentarlo.`,
      );
      return;
    }

    const confirmed = await confirmAction({
      title: "Eliminar tipo de dolor",
      message: `¿Seguro que quieres eliminar "${painType.name}"?`,
    });
    if (!confirmed) return;

    const result = await removePainType(painType.id);
    if (!result.success) showMessage("No se pudo eliminar", result.error);
  };

  return (
    <AppScreen scroll={false} contentContainerStyle={styles.container}>
      <HeroPanel
        eyebrow="CATALOGO DE DOLORES"
        title="Ordena el menu del drama corporal"
        description="Edita nombres e imagenes para que registrar un dolor sea rapido, claro y con personalidad."
      >
        <Text
          style={[
            styles.heroChip,
            {
              backgroundColor: paperTheme.colors.accentBerry,
              color: paperTheme.colors.onSurface,
            },
          ]}
        >
          Tipos: {painTypes.length}
        </Text>
      </HeroPanel>

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.painTypes, hasData: painTypes.length > 0, label: "los tipos de dolor", onRetry: loadPainTypesFromAPI },
        ]}
      />

      <Card
        style={[
          styles.listCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
      >
        <View
          style={[
            styles.listHeader,
            { borderBottomColor: paperTheme.colors.outlineVariant },
          ]}
        >
          <View>
            <Text variant="titleMedium" style={styles.listTitle}>
              Tipos disponibles
            </Text>
            <Text
              style={[
                styles.listSubtitle,
                { color: paperTheme.colors.onSurfaceVariant },
              ]}
            >
              Cada fila puede editarse o retirarse del catálogo.
            </Text>
          </View>
          <Text
            style={[
              styles.listCount,
              {
                backgroundColor: paperTheme.colors.secondaryContainer,
                color: paperTheme.colors.onSecondaryContainer,
              },
            ]}
          >
            {painTypes.length}
          </Text>
        </View>

        <FlatList
          data={painTypes}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No hay tipos cargados
              </Text>
              <Text
                style={{
                  color: paperTheme.colors.onSurfaceVariant,
                  textAlign: "center",
                }}
              >
                Agrega uno nuevo para empezar a personalizar el registro.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemRow,
                { backgroundColor: paperTheme.colors.surfaceVariant },
              ]}
            >
              <View style={styles.itemLead}>
                <IllustrationBadge
                  preset={getPainIllustration(resolvePainIllustrationKey(item))}
                  size={56}
                  style={styles.itemImage}
                />
                <View style={styles.itemMeta}>
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text
                    style={[
                      styles.itemSubtext,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    Disponible para nuevos registros
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <IconButton
                  icon="square-edit-outline"
                  size={20}
                  style={[
                    styles.itemActionButton,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  onPress={() => openEditScreen(item)}
                  accessibilityLabel={`Editar ${item.name}`}
                />
                <IconButton
                  icon="delete-circle-outline"
                  size={20}
                  style={[
                    styles.itemActionButton,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  onPress={() => handleDeletePainType(item)}
                  accessibilityLabel={`Eliminar ${item.name}`}
                />
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </Card>

      <FAB
        icon="plus"
        onPress={openAddScreen}
        style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
        color={paperTheme.colors.onPrimary}
        accessibilityLabel="Agregar nuevo tipo de dolor"
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  listCard: { flex: 1, borderRadius: 24, overflow: "hidden" },
  listHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listTitle: { fontWeight: "800" },
  listSubtitle: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  listCount: {
    minWidth: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 92 },
  emptyWrap: { paddingVertical: 32, alignItems: "center", gap: 8 },
  emptyTitle: { fontWeight: "800" },
  itemRow: {
    padding: 14,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  itemLead: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  itemImage: { flexShrink: 0 },
  itemMeta: { flex: 1 },
  itemText: { fontSize: 16, fontWeight: "700" },
  itemSubtext: { marginTop: 4, fontSize: 12, lineHeight: 17 },
  itemActions: { flexDirection: "row", gap: 8 },
  itemActionButton: { margin: 0 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

export default PainSettingsScreen;
