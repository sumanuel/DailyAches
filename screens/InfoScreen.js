import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Provider as PaperProvider,
  List,
} from "react-native-paper";

const InfoScreen = () => {
  const infoItems = [
    {
      title: "Dolor Menstrual",
      description:
        "Causado por contracciones uterinas durante la menstruación. Ayuda a liberar el revestimiento endometrial.",
    },
    {
      title: "Dolor de Cabeza",
      description:
        "Puede ser debido a cambios hormonales, estrés o deshidratación. Común durante el ciclo menstrual.",
    },
    {
      title: "Dolor de Espalda",
      description:
        "A menudo relacionado con cambios posturales, peso extra o relajación de ligamentos durante el embarazo.",
    },
    {
      title: "Dolor de Estómago",
      description:
        "Puede ser causado por indigestión, cambios hormonales o condiciones como el síndrome premenstrual.",
    },
    {
      title: "Dolor de Garganta",
      description:
        "A menudo debido a infecciones, alergias o sequedad. Más común en mujeres debido a cambios hormonales.",
    },
    {
      title: "Dolor de Dientes",
      description:
        "Puede estar relacionado con cambios hormonales que afectan las encías, o bruxismo inducido por estrés.",
    },
  ];

  return (
    <Provider as PaperProvider>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Información sobre Dolores Femeninos" />
          <Card.Content>
            <Text style={styles.intro}>
              Los dolores en mujeres pueden estar influenciados por factores
              hormonales, anatómicos y emocionales. Aquí explicamos algunos
              comunes:
            </Text>
            {infoItems.map((item, index) => (
              <List.Item
                key={index}
                title={item.title}
                description={item.description}
                left={(props) => <List.Icon {...props} icon="information" />}
              />
            ))}
            <Text style={styles.note}>
              Nota: Esta información es general. Consulta a un médico para
              diagnósticos específicos.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 10,
  },
  intro: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
  },
});

export default InfoScreen;
