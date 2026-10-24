import { Alert, Platform } from "react-native";

// Alert.alert does nothing on react-native-web, so on web these fall back to
// the browser dialogs. Both resolve once the user has answered.

export const confirmAction = ({
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
}) =>
  new Promise((resolve) => {
    if (Platform.OS === "web") {
      resolve(typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        { text: confirmText, style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });

export const showMessage = (title, message) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
};
