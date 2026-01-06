import Constants from "expo-constants";
import { Platform } from "react-native";

function getDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri === "string" && hostUri.length) {
    // hostUri is usually like "192.168.1.6:8081"
    return hostUri.split(":")[0];
  }

  return "localhost";
}

function getDevBaseUrl() {
  // Android emulator needs 10.0.2.2 to reach the host machine.
  if (Platform.OS === "android" && !Constants.isDevice) {
    return "http://10.0.2.2:3000/api";
  }

  const host = getDevHost();
  const baseUrl = `http://${host}:3000/api`;
  console.log("API Base URL:", baseUrl); // Agregar log para depurar
  return baseUrl;
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? getDevBaseUrl() : "https://your-production-api.com/api",
  TIMEOUT: 30000,
};

// Notes:
// - Physical device on LAN: uses Metro host IP (e.g. http://192.168.1.6:3000/api)
// - Android emulator: http://10.0.2.2:3000/api
// - If Metro runs in tunnel mode, set a fixed API URL manually.

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },
  ADMIN: {
    USERS: "/admin/users",
    BOOTSTRAP: "/admin/bootstrap",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const API_ERRORS = {
  NETWORK_ERROR: "Error de conexión. Verifica tu conexión a internet.",
  UNAUTHORIZED: "Credenciales inválidas.",
  FORBIDDEN: "No tienes permisos para realizar esta acción.",
  SERVER_ERROR: "Error del servidor. Inténtalo de nuevo.",
  UNKNOWN_ERROR: "Ha ocurrido un error desconocido.",
};
