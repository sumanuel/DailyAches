import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  TextInput,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useUser } from "../context/UserContext";

const ProfileScreen = () => {
  const paperTheme = usePaperTheme();
  const { user, updateProfile } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setName(user.profile?.name || "");
    setEmail(user.profile?.email || "");
  }, [user.profile?.name, user.profile?.email]);

  const onSave = () => {
    updateProfile({ name: name.trim(), email: email.trim() });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Perfil" />
        <Card.Content>
          <TextInput
            label="Nombre"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={styles.hint}>
            Tip: En modo demo, estos datos son locales.
          </Text>
          <Button mode="contained" onPress={onSave} style={styles.button}>
            Guardar
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { width: "100%" },
  input: { marginBottom: 12 },
  hint: { opacity: 0.7, marginTop: 4 },
  button: { marginTop: 16 },
});

export default ProfileScreen;
