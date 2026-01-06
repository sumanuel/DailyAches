import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
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
  IconButton,
} from "react-native-paper";
import { Image } from "expo-image";
import { useUser } from "../context/UserContext";

const avatarImages = {
  "DolorDeCabeza.png": require("../assets/avatars/DolorDeCabeza.png"),
  "DolorDeEspalda.png": require("../assets/avatars/DolorDeEspalda.png"),
  "DolorDePiernas.png": require("../assets/avatars/DolorDePiernas.png"),
  "Mujer feliz.png": require("../assets/avatars/Mujer feliz.png"),
  "Saltando.png": require("../assets/avatars/Saltando.png"),
};

const AddPersonScreen = ({ navigation, route }) => {
  const paperTheme = usePaperTheme();
  const { addPerson, updatePerson } = useUser();

  // Check if we're editing
  const isEdit = route?.params?.person ? true : false;
  const editPerson = route?.params?.person;

  const [name, setName] = useState(editPerson?.name || "");
  const [relationship, setRelationship] = useState(
    editPerson?.relationship || ""
  );
  const [phone, setPhone] = useState(editPerson?.phone || "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    editPerson?.whatsappEnabled || false
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    editPerson?.avatar || "Mujer feliz.png"
  );
  const [expanded, setExpanded] = useState(false);

  const avatars = [
    "DolorDeCabeza.png",
    "DolorDeEspalda.png",
    "DolorDePiernas.png",
    "Mujer feliz.png",
    "Saltando.png",
  ];

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
        personData.whatsappEnabled
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
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {isEdit ? "Editar Persona" : "Agregar Persona"}
            </Text>

            {/* Name Input */}
            <TextInput
              mode="outlined"
              label="Nombre *"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Relationship Selection */}
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

            {/* Phone Input */}
            <TextInput
              mode="outlined"
              label="Número de teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Ej: +58 412 123 4567"
            />

            {/* WhatsApp Checkbox */}
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

            {/* Avatar Selection */}
            <View style={styles.avatarSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Avatar
              </Text>
              <View style={styles.avatarGrid}>
                {avatars.map((avatar) => (
                  <TouchableOpacity
                    key={avatar}
                    onPress={() => setSelectedAvatar(avatar)}
                    style={[
                      styles.avatarOption,
                      selectedAvatar === avatar && styles.selectedAvatar,
                    ]}
                  >
                    <Image
                      source={avatarImages[avatar]}
                      style={styles.avatarImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
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
    justifyContent: "space-around",
  },
  avatarOption: {
    alignItems: "center",
    margin: 8,
    padding: 8,
    borderRadius: 8,
  },
  selectedAvatar: {
    backgroundColor: "#e3f2fd",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  },
});

export default AddPersonScreen;
