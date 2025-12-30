import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import {
  Button,
  Card,
  Menu,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useUser } from "../context/UserContext";

const screenWidth = Dimensions.get("window").width;

const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const StatsScreen = () => {
  const paperTheme = usePaperTheme();
  const { user } = useUser();
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!selectedPersonId && user.people?.length) {
      setSelectedPersonId(user.people[0].id);
    }
  }, [selectedPersonId, user.people]);

  const selectedPerson = useMemo(
    () => (user.people || []).find((p) => p.id === selectedPersonId) || null,
    [selectedPersonId, user.people]
  );

  const filteredRecords = useMemo(() => {
    const all = user.records || [];
    if (!selectedPersonId) return [];
    return all.filter((r) => r.personId === selectedPersonId);
  }, [selectedPersonId, user.records]);

  const last7Days = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  const weeklySeries = useMemo(() => {
    const counts = last7Days.map((d) => {
      return filteredRecords.filter((r) => isSameDay(new Date(r.createdAt), d))
        .length;
    });
    return {
      labels: last7Days.map((d) => dayLabels[d.getDay()]),
      datasets: [{ data: counts }],
    };
  }, [filteredRecords, last7Days]);

  const painTypeData = useMemo(() => {
    const counts = new Map();
    for (const r of filteredRecords) {
      const key = (r.pain || "(Sin dolor)").trim() || "(Sin dolor)";
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const palette = [
      paperTheme.colors.primary,
      paperTheme.colors.secondary,
      paperTheme.colors.tertiary,
      paperTheme.colors.error,
    ];

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], idx) => ({
        name,
        count,
        color: palette[idx % palette.length],
        legendFontColor: paperTheme.colors.onSurfaceVariant,
        legendFontSize: 12,
      }));
  }, [
    filteredRecords,
    paperTheme.colors.error,
    paperTheme.colors.onSurfaceVariant,
    paperTheme.colors.primary,
    paperTheme.colors.secondary,
    paperTheme.colors.tertiary,
  ]);

  const chartConfig = {
    backgroundColor: paperTheme.colors.surface,
    backgroundGradientFrom: paperTheme.colors.surface,
    backgroundGradientTo: paperTheme.colors.surface,
    decimalPlaces: 0,
    color: () => paperTheme.colors.primary,
    labelColor: () => paperTheme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: paperTheme.colors.secondary,
    },
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Card style={styles.card}>
        <Card.Title title="Estadísticas de Dolores" />
        <Card.Content>
          {!user.people?.length ? (
            <View>
              <Text variant="titleMedium">No hay personas</Text>
              <Text style={styles.muted}>
                Agrega una persona en “Registro” para ver estadísticas.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.selectRow}>
                <Text style={styles.selectLabel}>Persona:</Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                    >
                      {selectedPerson?.name || "Seleccionar"}
                    </Button>
                  }
                >
                  {(user.people || []).map((p) => (
                    <Menu.Item
                      key={p.id}
                      onPress={() => {
                        setSelectedPersonId(p.id);
                        setMenuVisible(false);
                      }}
                      title={p.name}
                    />
                  ))}
                </Menu>
              </View>

              <Text style={styles.chartTitle}>Últimos 7 días</Text>
              <LineChart
                data={weeklySeries}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />

              <Text style={styles.chartTitle}>Dolores más comunes</Text>
              {painTypeData.length === 0 ? (
                <Text style={styles.muted}>
                  Aún no hay registros para esta persona.
                </Text>
              ) : (
                <PieChart
                  data={painTypeData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              )}
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  selectLabel: { opacity: 0.8 },
  muted: { opacity: 0.7, marginTop: 6 },
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
