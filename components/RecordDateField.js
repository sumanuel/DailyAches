import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import PressableScale from "./PressableScale";
import {
  CUSTOM_DATE_KEY,
  RECORD_DATE_OPTIONS,
  formatCustomDate,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../utils/recordDate";

// "¿Cuándo fue?": quick day options plus "Otra fecha". `value` is
// { option, customDate }; the parent decides what to send (resolveRecordDate).
// The native picker does not exist on web, where a datetime-local input is used.
const RecordDateField = ({ value, onChange, error, style }) => {
  const paperTheme = usePaperTheme();
  // Android shows one dialog for the date and then another for the time.
  const [androidStep, setAndroidStep] = useState(null);
  const isCustom = value.option === CUSTOM_DATE_KEY;
  const customLabel = value.customDate
    ? formatCustomDate(value.customDate)
    : "Otra fecha";

  const choose = (option) => onChange({ ...value, option });

  const chooseCustom = () => {
    const customDate = value.customDate || new Date();
    onChange({ option: CUSTOM_DATE_KEY, customDate });
    if (Platform.OS === "android") setAndroidStep("date");
  };

  const onNativeChange = (event, selected) => {
    if (Platform.OS !== "android") {
      if (selected) onChange({ option: CUSTOM_DATE_KEY, customDate: selected });
      return;
    }
    if (event?.type === "dismissed" || !selected) {
      setAndroidStep(null);
      return;
    }
    if (androidStep === "date") {
      onChange({ option: CUSTOM_DATE_KEY, customDate: selected });
      setAndroidStep("time");
      return;
    }
    setAndroidStep(null);
    const base = value.customDate || selected;
    const customDate = new Date(base);
    customDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange({ option: CUSTOM_DATE_KEY, customDate });
  };

  const renderOption = ({ key, label, onPress, selected }) => (
    <PressableScale
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.option,
        {
          backgroundColor: selected
            ? paperTheme.colors.primaryContainer
            : paperTheme.colors.surfaceVariant,
          borderColor: selected ? paperTheme.colors.primary : "transparent",
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: selected
            ? paperTheme.colors.onPrimaryContainer
            : paperTheme.colors.onSurface,
          fontWeight: selected ? "800" : "500",
        }}
      >
        {label}
      </Text>
    </PressableScale>
  );

  return (
    <View style={style}>
      <Text variant="titleSmall" accessibilityRole="header" style={styles.title}>
        ¿Cuándo fue?
      </Text>
      <View style={styles.options}>
        {RECORD_DATE_OPTIONS.map((option) =>
          renderOption({
            key: option.key,
            label: option.label,
            selected: value.option === option.key,
            onPress: () => choose(option.key),
          }),
        )}
        {renderOption({
          key: CUSTOM_DATE_KEY,
          label: customLabel,
          selected: isCustom,
          onPress: chooseCustom,
        })}
      </View>

      {isCustom && Platform.OS === "web"
        ? React.createElement("input", {
            type: "datetime-local",
            "aria-label": "Fecha y hora del dolor",
            value: toDateTimeLocalValue(value.customDate),
            max: toDateTimeLocalValue(new Date()),
            onChange: (event) =>
              onChange({
                option: CUSTOM_DATE_KEY,
                customDate: fromDateTimeLocalValue(event.target.value),
              }),
            style: {
              marginTop: 12,
              padding: 12,
              fontSize: 16,
              borderRadius: 12,
              border: `1px solid ${paperTheme.colors.outline}`,
              backgroundColor: paperTheme.colors.surface,
              color: paperTheme.colors.onSurface,
            },
          })
        : null}

      {isCustom && Platform.OS === "ios" ? (
        <DateTimePicker
          value={value.customDate || new Date()}
          mode="datetime"
          display="compact"
          maximumDate={new Date()}
          onChange={onNativeChange}
          style={styles.iosPicker}
        />
      ) : null}

      {Platform.OS === "android" && androidStep ? (
        <DateTimePicker
          value={value.customDate || new Date()}
          mode={androidStep}
          is24Hour
          maximumDate={new Date()}
          onChange={onNativeChange}
        />
      ) : null}

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: paperTheme.colors.error }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: "800", marginBottom: 8 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 2,
  },
  iosPicker: { alignSelf: "flex-start", marginTop: 8 },
  error: { fontSize: 12, marginTop: 6 },
});

export default RecordDateField;
