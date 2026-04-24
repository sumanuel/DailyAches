import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Alert, Platform } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "../context/UserContext";
import AppScreen from "../components/AppScreen";
import HeroPanel from "../components/HeroPanel";
import AppTextField from "../components/AppTextField";

const ProfileScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, updateProfile } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const styles = StyleSheet.create({
    container: { paddingBottom: 24 },
    card: { width: "100%", borderRadius: 24, overflow: "hidden" },
    formTitle: { marginBottom: 16, fontWeight: "800" },
    input: { marginBottom: 12 },
    label: {
      fontSize: 12,
      color: paperTheme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    hint: { opacity: 0.7, marginTop: 4 },
    button: { marginTop: 16, borderRadius: 16 },
  });

  useEffect(() => {
    setName(user.profile?.name || "");
    setEmail(user.profile?.email || "");
    setPhone(user.profile?.phone || "");
    setBirthDate(user.profile?.birth_date || "");
  }, [user.profile]);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setBirthDate(formattedDate);
    }
  };

  const onSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        birth_date: birthDate.trim() || null,
      });
      Alert.alert("Éxito", "Datos actualizados correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "No se pudieron actualizar los datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <HeroPanel
        compact
        eyebrow="TU FICHA"
        title="Perfil con datos, no con drama"
        description="Aqui ajustas lo basico para que DailyAches te acompañe mejor y sepa un poco mas de ti."
      />

      <Card
        style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      >
        <Card.Content>
          <Text variant="titleLarge" style={styles.formTitle}>
            Perfil
          </Text>
          <AppTextField
            label="Email"
            value={email}
            editable={false}
            style={styles.input}
          />
          <AppTextField
            label="Nombre"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <AppTextField
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Text variant="bodySmall" style={styles.label}>
            Fecha de nacimiento
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.input}
          >
            {birthDate || "Seleccionar fecha"}
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate ? new Date(birthDate) : new Date()}
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "default"}
              onChange={onDateChange}
            />
          )}
          <Text style={styles.hint}>
            Tip: En modo demo, estos datos son locales.
          </Text>
          <Button
            mode="contained"
            onPress={onSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Card.Content>
      </Card>
    </AppScreen>
  );
};

export default ProfileScreen;
