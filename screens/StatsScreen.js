import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import {
  Text,
  Card,
  Provider as PaperProvider,
  Button,
} from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const StatsScreen = ({ navigation }) => {
  const [timeFrame, setTimeFrame] = useState("month"); // 'week', 'month', 'year'

  // Datos simulados
  const weeklyData = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        data: [2, 1, 3, 0, 2, 1, 0],
      },
    ],
  };

  const monthlyData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        data: [15, 12, 18, 10, 14, 8],
      },
    ],
  };

  const painTypesData = [
    {
      name: "Cabeza",
      count: 20,
      color: "#FF6384",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Espalda",
      count: 15,
      color: "#36A2EB",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Menstrual",
      count: 25,
      color: "#FFCE56",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Estómago",
      count: 10,
      color: "#4BC0C0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  const currentData = timeFrame === "week" ? weeklyData : monthlyData;

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Estadísticas de Dolores" />
          <Card.Content>
            <View style={styles.buttonGroup}>
              <Button
                mode={timeFrame === "week" ? "contained" : "outlined"}
                onPress={() => setTimeFrame("week")}
              >
                Semana
              </Button>
              <Button
                mode={timeFrame === "month" ? "contained" : "outlined"}
                onPress={() => setTimeFrame("month")}
              >
                Mes
              </Button>
            </View>

            <Text style={styles.chartTitle}>Tendencia de Dolores</Text>
            <LineChart
              data={currentData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />

            <Text style={styles.chartTitle}>Tipos de Dolores Más Comunes</Text>
            <PieChart
              data={painTypesData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />

            <Text style={styles.chartTitle}>Niveles y Puntos</Text>
            <BarChart
              data={{
                labels: ["Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4"],
                datasets: [
                  {
                    data: [50, 120, 80, 200],
                  },
                ],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
});

export default StatsScreen;
