import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import AppTextField from "./AppTextField";
import BottomSheet, { SheetCancel, SheetRow } from "./BottomSheet";

// A field that looks like the other inputs and opens a sheet with the options
// when tapped (instead of an accordion that unfolds inside the form).
// `options` is a list of strings; `value` may be one that is not in the list.
const SelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Seleccionar",
  style,
}) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const choices = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <View style={style}>
      {/* The field only draws; a Pressable laid over it takes the touch. It
          cannot wrap the field because the chevron is a button too, and a
          button inside a button is invalid on web. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
      >
        <AppTextField
          label={label}
          value={value}
          placeholder={placeholder}
          editable={false}
          focusable={false}
          right={<TextInput.Icon icon="chevron-down" focusable={false} />}
          style={styles.input}
        />
      </View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        style={StyleSheet.absoluteFill}
      />

      <BottomSheet
        visible={open}
        onClose={close}
        title={label}
        scroll
        footer={<SheetCancel onPress={close} />}
      >
        {choices.map((option) => (
          <SheetRow
            key={option}
            label={option}
            selected={option === value}
            onPress={() => {
              close();
              onChange(option);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  input: { marginBottom: 0 },
});

export default SelectField;
