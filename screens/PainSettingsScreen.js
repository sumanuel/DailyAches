import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const PainSettingsScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, addPainType, removePainType } = useUser();

  const painTypes = useMemo(() => user.painTypes || [], [user.painTypes]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPain, setNewPain] = useState("");

  const open = () => {
    setNewPain("");
    setDialogVisible(true);
  };

  const close = () => setDialogVisible(false);

  const onAdd = () => {
    addPainType(newPain);
    close();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Configurar dolores" />
        <Card.Content>
          <Text style={styles.sub}>
            Estos son los tipos disponibles al registrar un dolor.
          </Text>
        </Card.Content>

        <FlatList
          data={painTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text>{item}</Text>
              <IconButton
                icon="delete"
                onPress={() => removePainType(item)}
                accessibilityLabel={`Eliminar ${item}`}
              />
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.sep,
                { backgroundColor: paperTheme.colors.outlineVariant },
              ]}
            />
          )}
          contentContainerStyle={styles.listContent}
        />

        <Card.Actions>
          <Button mode="contained" onPress={open}>
            Agregar dolor
          </Button>
        </Card.Actions>
      </Card>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={close}>
          <Dialog.Title>Nuevo dolor</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre"
              value={newPain}
              onChangeText={setNewPain}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close}>Cancelar</Button>
            <Button onPress={onAdd}>Agregar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { width: "100%", borderRadius: 16, overflow: "hidden" },
  sub: { opacity: 0.7, marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  itemRow: {
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sep: { height: StyleSheet.hairlineWidth, opacity: 0.6 },
});

export default PainSettingsScreen;
