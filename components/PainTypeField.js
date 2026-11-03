import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Text, useTheme as usePaperTheme } from "react-native-paper";
import AppTextField from "./AppTextField";
import BottomSheet, { SheetCancel } from "./BottomSheet";
import FieldError from "./FieldError";
import IllustrationBadge from "./IllustrationBadge";
import {
  getPainIllustration,
  resolvePainIllustrationKey,
} from "../constants/illustrations";
import { normalizeText } from "../utils/recordFilters";

const keyOf = (item) => String(item.id ?? item.name);

// The pain of a record: shows the chosen type and opens a sheet to pick one,
// with a search box for a long catalog. `value` and `options` are pain types
// ({ id, name, image }); `onChange` gets the one that was tapped.
const PainTypeField = ({ value, options, onChange, error, style }) => {
  const paperTheme = usePaperTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const needle = normalizeText(query);
    if (!needle) return options;
    return options.filter((pain) => normalizeText(pain.name).includes(needle));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const choose = (pain) => {
    onChange(pain);
    close();
  };

  return (
    <View style={style}>
      <Text variant="titleMedium" style={styles.title}>
        Dolor
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={value ? `Dolor: ${value.name}. Cambiar` : "Elegir el dolor"}
        style={[
          styles.field,
          {
            backgroundColor: paperTheme.colors.surfaceVariant,
            borderColor: error ? paperTheme.colors.error : "transparent",
          },
        ]}
      >
        {value ? (
          <IllustrationBadge
            preset={getPainIllustration(resolvePainIllustrationKey(value))}
            size={48}
          />
        ) : (
          <View
            style={[
              styles.empty,
              { backgroundColor: paperTheme.colors.surface, borderColor: paperTheme.colors.outline },
            ]}
          >
            <Icon source="plus" size={22} color={paperTheme.colors.onSurfaceVariant} />
          </View>
        )}
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.name}>
            {value ? value.name : "Elegir el dolor"}
          </Text>
          <Text style={[styles.hint, { color: paperTheme.colors.onSurfaceVariant }]}>
            {value ? "Toca para cambiarlo" : "Obligatorio"}
          </Text>
        </View>
        <Icon source="chevron-down" size={24} color={paperTheme.colors.onSurfaceVariant} />
      </Pressable>
      <FieldError message={error} />

      <BottomSheet
        visible={open}
        onClose={close}
        title="Elige el dolor"
        scroll
        footer={<SheetCancel onPress={close} label="Cerrar" />}
      >
        <View style={styles.search}>
          <AppTextField
            label="Buscar"
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrar por nombre"
          />
        </View>
        {options.length === 0 ? (
          <Text style={[styles.message, { color: paperTheme.colors.onSurfaceVariant }]}>
            Aún no hay tipos de dolor. Agrégalos en Más, Configurar dolores.
          </Text>
        ) : shown.length === 0 ? (
          <Text style={[styles.message, { color: paperTheme.colors.onSurfaceVariant }]}>
            Ningún dolor se llama así.
          </Text>
        ) : (
          <View style={styles.grid}>
            {shown.map((pain) => {
              const selected = value?.name === pain.name;
              return (
                <Pressable
                  key={keyOf(pain)}
                  onPress={() => choose(pain)}
                  accessibilityRole="button"
                  accessibilityLabel={pain.name}
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
                    preset={getPainIllustration(resolvePainIllustrationKey(pain))}
                    size={56}
                    selected={selected}
                  />
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.tileLabel,
                      {
                        color: selected
                          ? paperTheme.colors.onPrimaryContainer
                          : paperTheme.colors.onSurface,
                      },
                    ]}
                  >
                    {pain.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: 10, fontWeight: "600" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
  },
  empty: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "800" },
  hint: { fontSize: 12 },
  search: { paddingHorizontal: 24, paddingBottom: 8 },
  message: { paddingHorizontal: 24, paddingVertical: 20, lineHeight: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  tile: {
    width: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  tileLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
});

export default PainTypeField;
