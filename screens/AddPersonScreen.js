import React, { useState } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Button,
  useTheme as usePaperTheme,
  Checkbox,
} from "react-native-paper";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";
import AvatarField from "../components/AvatarField";
import FieldError from "../components/FieldError";
import SelectField from "../components/SelectField";
import { validateName, validatePhone } from "../utils/validation";

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
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const relationshipOptions = [
    "Esposa",
    "Novia",
    "Madre",
    "Hermana",
    "Prima",
    "Amiga",
    "Otro",
  ];

  const handleSave = async () => {
    const nextErrors = {
      name: validateName(name),
      phone: validatePhone(phone),
    };
    setErrors(nextErrors);
    setFormError("");
    if (nextErrors.name || nextErrors.phone) return;

    const personData = {
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      whatsappEnabled,
      avatar: selectedAvatar,
    };

    setSaving(true);
    const result =
      isEdit && editPerson
        ? await updatePerson(editPerson.id, personData)
        : await addPerson(
            personData.name,
            personData.relationship,
            personData.avatar,
            personData.phone,
            personData.whatsappEnabled,
          );
    setSaving(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppScreen contentContainerStyle={styles.contentContainer}>
        <HeroPanel
          compact
          eyebrow={isEdit ? "EDITAR PERSONA" : "NUEVA PERSONA"}
          title={
            isEdit
              ? "Actualiza la ficha de la persona"
              : "Agrega una persona al registro"
          }
          description="Guarda su nombre, relación y una foto o avatar para identificar sus achaques."
        />

        <Card
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>
              {isEdit ? "Editar Persona" : "Agregar Persona"}
            </Text>

            <AppTextField
              label="Nombre *"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              error={Boolean(errors.name)}
              style={styles.input}
            />
            <FieldError message={errors.name} />

            <SelectField
              label="Relación"
              value={relationship}
              options={relationshipOptions}
              onChange={setRelationship}
              placeholder="Seleccionar relación"
              style={styles.input}
            />

            <AppTextField
              label="Número de teléfono"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              error={Boolean(errors.phone)}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Ej: +58 412 123 4567"
            />
            <FieldError message={errors.phone} />

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
                Enviar sus recordatorios por WhatsApp
              </Text>
            </View>

            <AvatarField
              value={selectedAvatar}
              onChange={setSelectedAvatar}
              style={styles.avatarSection}
            />

            <FieldError message={formError} />
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
                loading={saving}
                disabled={saving}
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
  input: {
    marginBottom: 16,
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
