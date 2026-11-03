import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Text, useTheme as usePaperTheme } from "react-native-paper";
import BottomSheet, { SheetCancel } from "./BottomSheet";
import IllustrationBadge from "./IllustrationBadge";
import {
  getPainIllustration,
  painIllustrationKeys,
  resolvePainIllustrationKey,
} from "../constants/illustrations";

// "Cabeza.png" -> "Cabeza", "DolorDeCabeza.png" -> "Dolor de cabeza"
const nameOf = (key) => {
  const [first, ...rest] = key
    .replace(/\.png$/i, "")
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
    .split(" ");
  return [first, ...rest.map((word) => word.toLowerCase())].join(" ");
};

// The icon of a pain type: shows the current one and opens a sheet with all of
// them to pick from. `value` is an illustration key (see constants/illustrations).
const PainIconField = ({ value, onChange, style }) => {
  const paperTheme = usePaperTheme();
  const [open, setOpen] = useState(false);
  const current = resolvePainIllustrationKey(value);

  const choose = (key) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <View style={style}>
      <Text variant="titleMedium" style={styles.title}>
        Icono
      </Text>
      <View style={styles.current}>
        <IllustrationBadge preset={getPainIllustration(current)} size={72} />
        <View style={styles.currentCopy}>
          <Text style={styles.currentLabel}>{nameOf(current)}</Text>
          <Button
            mode="outlined"
            icon="image-edit-outline"
            onPress={() => setOpen(true)}
            style={styles.changeButton}
            accessibilityLabel="Cambiar el icono"
          >
            Cambiar
          </Button>
        </View>
      </View>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Elige el icono"
        scroll
        footer={<SheetCancel onPress={() => setOpen(false)} label="Cerrar" />}
      >
        <View style={styles.grid}>
          {painIllustrationKeys.map((key) => {
            const selected = key === current;
            return (
              <Pressable
                key={key}
                onPress={() => choose(key)}
                accessibilityRole="button"
                accessibilityLabel={nameOf(key)}
                accessibilityState={{ selected }}
                style={[
                  styles.tile,
                  {
                    backgroundColor: selected
                      ? paperTheme.colors.primaryContainer
                      : paperTheme.colors.surfaceVariant,
                    borderColor: selected ? paperTheme.colors.primary : "transparent",
                  },
                ]}
              >
                <IllustrationBadge
                  preset={getPainIllustration(key)}
                  size={52}
                  selected={selected}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tileLabel,
                    {
                      color: selected
                        ? paperTheme.colors.onPrimaryContainer
                        : paperTheme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {nameOf(key)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: 12, fontWeight: "600" },
  current: { flexDirection: "row", alignItems: "center", gap: 16 },
  currentCopy: { flex: 1, gap: 8, alignItems: "flex-start" },
  currentLabel: { fontSize: 15, fontWeight: "700" },
  changeButton: { borderRadius: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
  },
  tile: {
    width: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 2,
    gap: 6,
  },
  tileLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});

export default PainIconField;
