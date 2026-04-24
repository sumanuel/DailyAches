import React from "react";
import { StyleSheet } from "react-native";
import { TextInput } from "react-native-paper";

const AppTextField = ({ contentStyle, style, dense = true, ...props }) => {
  return (
    <TextInput
      dense={dense}
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
