import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

// A field with `secureTextEntry` gets an eye to show or hide what is typed.
const AppTextField = ({
  contentStyle,
  style,
  dense = true,
  secureTextEntry,
  right,
  ...props
}) => {
  const [hidden, setHidden] = useState(true);
  const eye = secureTextEntry ? (
    <TextInput.Icon
      icon={hidden ? "eye-outline" : "eye-off-outline"}
      onPress={() => setHidden((value) => !value)}
      forceTextInputFocus={false}
      accessibilityLabel={hidden ? "Mostrar contraseña" : "Ocultar contraseña"}
    />
  ) : null;

  return (
    <TextInput
      dense={dense}
      secureTextEntry={secureTextEntry ? hidden : undefined}
      right={eye || right}
      mode="outlined"
      style={[styles.input, style]}
      contentStyle={[styles.content, contentStyle]}
      outlineStyle={styles.outline}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "transparent",
  },
  content: {
    fontSize: 14,
    lineHeight: 18,
    paddingVertical: 6,
  },
  outline: {
    borderRadius: 16,
  },
});

export default AppTextField;
