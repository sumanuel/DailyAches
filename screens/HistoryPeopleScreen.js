import React, { useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton } from "react-native-paper";
import PersonRow from "../components/PersonRow";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import EmptyState from "../components/EmptyState";
import HeroPanel from "../components/HeroPanel";
import { countRecordsFor, describeRecordCount } from "../utils/recordFilters";
import LoadStatusNotice from "../components/LoadStatusNotice";

const keyExtractor = (person) => String(person.id);

const HistoryPeopleScreen = ({ navigation }) => {
  const { user, loadPeopleFromAPI, remoteStatus } = useUser();

  useEffect(() => {
    loadPeopleFromAPI();
  }, [loadPeopleFromAPI]);

  const filtered = useMemo(() => user.people || [], [user.people]);

  const onSelectPerson = (person) => {
    navigation.navigate("HistoryDetail", {
      personId: person.id,
      personName: person.name,
    });
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
        accessibilityLabel={`Ver historial de ${p.name}`}
        onPress={() => onSelectPerson(p)}
        right={<IconButton icon="chevron-right" accessibilityElementsHidden />}
      />
    );
  };

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="HISTORIAL"
        title="¿De quién vemos el historial?"
        description="Cada ficha abre el archivo completo de molestias, fechas y episodios de esa persona."
      />

      <LoadStatusNotice
        sources={[
          { status: remoteStatus.people, hasData: (user.people || []).length > 0, label: "las personas", onRetry: loadPeopleFromAPI },
        ]}
      />

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <EmptyState
            illustration="Zen.png"
            title="Sin expedientes todavía"
            description="Agrega una persona en Registro y aquí empezará a armarse su historial."
            actionLabel="Ir a Registro"
            onAction={() => navigation.getParent()?.navigate("Registro")}
          />
        ) : (
          filtered.map(renderPerson)
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  list: { marginTop: 12 },
});

export default HistoryPeopleScreen;
