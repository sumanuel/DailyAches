import React from "react";
import { HelperText } from "react-native-paper";

// Message under a field; renders nothing when there is no error.
const FieldError = ({ message }) =>
  message ? (
    <HelperText type="error" visible accessibilityLiveRegion="polite">
      {message}
    </HelperText>
  ) : null;

export default FieldError;
