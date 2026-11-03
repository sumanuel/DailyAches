import React, { useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { FAB, useTheme as usePaperTheme } from "react-native-paper";
import ActionMenu from "../components/ActionMenu";
import PersonRow from "../components/PersonRow";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import HeroPanel from "../components/HeroPanel";
import LoadStatusNotice from "../components/LoadStatusNotice";
import { confirmAction, showMessage } from "../utils/confirm";
import { countRecordsFor, describeRecordCount } from "../utils/recordFilters";

const keyExtractor = (person) => String(person.id);

const PeopleScreen = ({ navigation }) => {
  const paperTheme = usePaperTheme();
  const { user, removePerson, loadPeopleFromAPI, remoteStatus } = useUser();

  const openAdd = () => {
    navigation.navigate("AddPerson");
  };

  const openEdit = (person) => {
    navigation.navigate("AddPerson", { person });
  };

  const filtered = useMemo(() => user.people || [], [user.people]);

  const onSelectPerson = (person) => {
    navigation.navigate("RecordPain", {
      personId: person.id,
      personName: person.name,
    });
  };

  useEffect(() => {
    loadPeopleFromAPI();
  }, [loadPeopleFromAPI]);

  const handleRemovePerson = async (person) => {
    const recordCount = countRecordsFor(user.records, { personId: person.id });
    const confirmed = await confirmAction(
      recordCount === 0
        ? {
            title: "Eliminar persona",
            message: `¿Quitamos a ${person.name} de tu radar de achaques?`,
          }
        : {
            title: "Eliminar persona y sus registros",
            message: `${person.name} tiene ${describeRecordCount(
              recordCount,
            )}. Si la eliminas, también se borrarán y no se podrán recuperar.`,
            confirmText: "Eliminar todo",
          },
    );
    if (!confirmed) return;

    const result = await removePerson(person.id);
    if (!result.success) showMessage("No se pudo eliminar", result.error);
  };

  const renderPerson = (p) => {
    const recordCount = countRecordsFor(user.records, { personId: p.id });
    const detail = [p.relationship, describeRecordCount(recordCount)]
      .filter(Boolean)
      .join(" · ");
    return (
      <PersonRow
        key={keyExtractor(p)}
        person={p}
        detail={detail}
        accessibilityLabel={`Registrar dolor de ${p.name}`}
        onPress={() => onSelectPerson(p)}
        right={
          <ActionMenu
            title={p.name}
            actions={[
              { label: "Editar", icon: "square-edit-outline", onPress: () => openEdit(p) },
              {
                label: "Eliminar",
                icon: "delete-outline",
                onPress: () => handleRemovePerson(p),
                destructive: true,
              },
            ]}
          />
        }
      />
    );
  };

  return (
    <AppScreen
      contentContainerStyle={styles.container}
      overlay={
        <FAB
          icon="plus"
          accessibilityLabel="Agregar persona"
          style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
          color={paperTheme.colors.onPrimary}
          onPress={openAdd}
        />
      }
    >
      <HeroPanel
        compact
        eyebrow="PERSONAS"
        title="¿Quién tiene achaque hoy?"
        description="Toca a una persona para registrar su dolor. Desde el menú de cada ficha puedes editarla o eliminarla."
      />

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.people, hasData: (user.people || []).length > 0, label: "las personas", onRetry: loadPeopleFromAPI },
        ]}
      />

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <EmptyState
            illustration="Mujer feliz.png"
            title="Todavía no hay elenco"
            description="Agrega a la primera persona y empieza a anotar sus molestias, con cariño y un toque de humor."
            actionLabel="Agregar persona"
            onAction={openAdd}
          />
        ) : (
          filtered.map(renderPerson)
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 96 },
  list: { marginTop: 12 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});

export default PeopleScreen;
