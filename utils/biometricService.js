import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sign in with the fingerprint (or face) of the phone. The email and password
// are kept in the phone's secure storage behind a biometric check, so reading
// them back is what asks for the fingerprint. Nothing is stored on the server.

const CREDENTIALS_KEY = "biometricCredentials"; // secure store: { email, password }
const EMAIL_KEY = "biometricEmail"; // async storage: who is saved (not secret)

export const SAVE_PROMPT = "Confirma con tu huella para activar el acceso rápido";
export const LOGIN_PROMPT = "Entra con tu huella";

export const SAVE_FAILED_MESSAGE =
  "No se pudo activar la huella en este teléfono. Puedes seguir entrando con tu contraseña.";
export const READ_FAILED_MESSAGE =
  "No se pudo usar la huella. Entra con tu contraseña.";
export const CHANGED_MESSAGE =
  "La huella del teléfono cambió, así que desactivamos el acceso rápido. Entra con tu contraseña y vuelve a activarlo.";

// expo-local-authentication and expo-secure-store are native modules: they are
// loaded when first needed, never at the top of the file, so a build that lacks
// one just means "no fingerprint here" instead of a crash at start.
let modules; // undefined = not tried yet, null = not available
const getModules = () => {
  if (modules !== undefined) return modules;
  if (Platform.OS === "web") {
    modules = null;
    return modules;
  }
  try {
    modules = {
      auth: require("expo-local-authentication"),
      store: require("expo-secure-store"),
    };
  } catch (error) {
    console.warn("Biometric login is not available:", error.message);
    modules = null;
  }
  return modules;
};

// What went wrong when the secure storage was read or written.
export const describeBiometricError = (error) => {
  const text = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  if (/cancel|user_cancel|usercancel|dismiss|negative button/.test(text)) {
    return { cancelled: true, reset: false, message: "" };
  }
  // A new fingerprint was added or removed: the saved key can no longer be used.
  if (/invalidat|decrypt|key permanently|keystore|biometric.*(changed|enroll)/.test(text)) {
    return { cancelled: false, reset: true, message: CHANGED_MESSAGE };
  }
  return { cancelled: false, reset: false, message: READ_FAILED_MESSAGE };
};

// The phone has the sensor and at least one fingerprint (or face) enrolled.
export const isBiometricSupported = async () => {
  const native = getModules();
  if (!native) return false;
  try {
    const [hardware, enrolled] = await Promise.all([
      native.auth.hasHardwareAsync(),
      native.auth.isEnrolledAsync(),
    ]);
    return Boolean(hardware && enrolled);
  } catch {
    return false;
  }
};

// Email of the account saved for fingerprint login, or null when it is off.
export const getSavedEmail = async () => {
  try {
    return (await AsyncStorage.getItem(EMAIL_KEY)) || null;
  } catch {
    return null;
  }
};

export const saveCredentials = async (email, password) => {
  const native = getModules();
  if (!native) return { success: false, error: SAVE_FAILED_MESSAGE };
  try {
    await native.store.setItemAsync(
      CREDENTIALS_KEY,
      JSON.stringify({ email, password }),
      { requireAuthentication: true, authenticationPrompt: SAVE_PROMPT },
    );
    await AsyncStorage.setItem(EMAIL_KEY, email);
    return { success: true };
  } catch (error) {
    const problem = describeBiometricError(error);
    return {
      success: false,
      cancelled: problem.cancelled,
      error: problem.cancelled ? "" : SAVE_FAILED_MESSAGE,
    };
  }
};

// Asks for the fingerprint and returns { success, credentials } or
// { success: false, cancelled, error }. When the saved key stopped working the
// saved data is cleared, since it can never be read again.
export const readCredentials = async () => {
  const native = getModules();
  if (!native) return { success: false, cancelled: false, error: READ_FAILED_MESSAGE };
  try {
    const raw = await native.store.getItemAsync(CREDENTIALS_KEY, {
      requireAuthentication: true,
      authenticationPrompt: LOGIN_PROMPT,
    });
    const credentials = raw ? JSON.parse(raw) : null;
    if (!credentials?.email || !credentials?.password) {
      await clearCredentials();
      return { success: false, cancelled: false, error: READ_FAILED_MESSAGE };
    }
    return { success: true, credentials };
  } catch (error) {
    const problem = describeBiometricError(error);
    if (problem.reset) await clearCredentials();
    return { success: false, cancelled: problem.cancelled, error: problem.message };
  }
};

export const clearCredentials = async () => {
  const native = getModules();
  try {
    await native?.store.deleteItemAsync(CREDENTIALS_KEY);
  } catch {
    // Nothing saved, or it cannot be deleted from here: the flag below is what counts.
  }
  try {
    await AsyncStorage.removeItem(EMAIL_KEY);
  } catch {
    // Same: the app keeps working, only the button would show up in vain.
  }
};
