import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  Button,
  useTheme as usePaperTheme,
  Checkbox,
  List,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import IllustrationBadge from "../components/IllustrationBadge";
import {
  avatarIllustrationKeys,
  getAvatarIllustration,
} from "../constants/illustrations";

const AddPersonScreen = ({ navigation, route }) => {
  const paperTheme = usePaperTheme();
  const { addPerson, updatePerson } = useUser();

  // Check if we're editing
  const isEdit = route?.params?.person ? true : false;
  const editPerson = route?.params?.person;

  const [name, setName] = useState(editPerson?.name || "");
  const [relationship, setRelationship] = useState(
    editPerson?.relationship || "",
  );
  const [phone, setPhone] = useState(editPerson?.phone || "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    editPerson?.whatsappEnabled || false,
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    editPerson?.avatar || "Mujer feliz.png",
  );
  const [expanded, setExpanded] = useState(false);

  const avatars = avatarIllustrationKeys;

  const relationshipOptions = [
    "Esposa",
    "Novia",
    "Madre",
    "Hermana",
    "Prima",
    "Amiga",
    "Otro",
  ];

  const handleSave = () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre");
      return;
    }

    const personData = {
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      whatsappEnabled,
      avatar: selectedAvatar,
    };

    if (isEdit && editPerson) {
      updatePerson(editPerson.id, personData);
    } else {
      addPerson(
        personData.name,
        personData.relationship,
        personData.avatar,
        personData.phone,
        personData.whatsappEnabled,
      );
    }

    navigation.goBack();
  };

  const handleRelationshipSelect = (option) => {
    setRelationship(option);
    setExpanded(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppScreen contentContainerStyle={styles.contentContainer}>
        <HeroPanel
          eyebrow={isEdit ? "EDITAR PERSONA" : "NUEVA PERSONA"}
          title={
            isEdit
              ? "Ajusta la ficha del personaje"
              : "Agrega a alguien a tu radar"
          }
          description="Ponle nombre, relacion y avatar para que registrar dolores sea rapido y visualmente claro."
        />

        <Card
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {isEdit ? "Editar Persona" : "Agregar Persona"}
            </Text>

            <TextInput
              mode="outlined"
              label="Nombre *"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <List.Accordion
              title="Relación"
              description={relationship || "Seleccionar relación"}
              expanded={expanded}
              onPress={() => setExpanded(!expanded)}
              style={styles.accordion}
            >
              {relationshipOptions.map((option) => (
                <List.Item
                  key={option}
                  title={option}
                  onPress={() => handleRelationshipSelect(option)}
                  style={styles.listItem}
                />
              ))}
            </List.Accordion>

            <TextInput
              mode="outlined"
              label="Número de teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Ej: +58 412 123 4567"
            />

            <View style={styles.checkboxSection}>
              <Checkbox
                status={whatsappEnabled ? "checked" : "unchecked"}
                onPress={() => setWhatsappEnabled(!whatsappEnabled)}
              />
              <Text
                variant="bodyMedium"
                style={styles.checkboxLabel}
                onPress={() => setWhatsappEnabled(!whatsappEnabled)}
              >
                Enviar recordatorios por WhatsApp
              </Text>
            </View>

            <View style={styles.avatarSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Avatar
              </Text>
              <View style={styles.avatarGrid}>
                {avatars.map((avatar) => {
                  const preset = getAvatarIllustration(avatar);

                  return (
                    <Pressable
                      key={avatar}
                      onPress={() => setSelectedAvatar(avatar)}
                      style={[
                        styles.avatarOption,
                        {
                          backgroundColor:
                            selectedAvatar === avatar
                              ? paperTheme.colors.primaryContainer
                              : paperTheme.colors.surfaceVariant,
                          borderColor:
                            selectedAvatar === avatar
                              ? paperTheme.colors.primary
                              : "transparent",
                        },
                        selectedAvatar === avatar && styles.selectedAvatar,
                      ]}
                    >
                      <IllustrationBadge
                        preset={preset}
                        size={54}
                        selected={selectedAvatar === avatar}
                        style={styles.avatarImage}
                      />
                      <Text
                        style={[
                          styles.avatarLabel,
                          {
                            color:
                              selectedAvatar === avatar
                                ? paperTheme.colors.onPrimaryContainer
                                : paperTheme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
                disabled={!name.trim()}
              >
                {isEdit ? "Actualizar" : "Agregar"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </AppScreen>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "800",
  },
  avatarSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  avatarOption: {
    alignItems: "center",
    width: "31%",
    minWidth: 90,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  selectedAvatar: {
    transform: [{ scale: 1.03 }],
  },
  avatarImage: {
    flexShrink: 0,
  },
  avatarLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  accordion: {
    backgroundColor: "transparent",
    marginBottom: 16,
  },
  listItem: {
    paddingLeft: 16,
  },
  checkboxSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
  },
});

export default AddPersonScreen;
