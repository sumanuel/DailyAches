import Constants from "expo-constants";
import { Platform } from "react-native";

const FALLBACK_DEV_API_URL = "http://192.168.1.8:3000/api";

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

function normalizeBaseUrl(url) {
  if (typeof url !== "string") return null;
  const trimmed = url.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function getDevBaseUrl() {
  const envBaseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Android emulator should use the special alias to reach the host machine. Jesús IP consola API
  if (Platform.OS === "android" && !Constants.isDevice) {
    return "http://192.168.1.8:3000/api";
  }

  // Physical devices need a stable LAN address. Avoid auto-detected virtual
  // adapters like 172.30.x.x from Hyper-V/WSL because phones cannot route to
  // them reliably.
  if (Constants.isDevice) {
    return FALLBACK_DEV_API_URL;
  }

  // iOS simulator / web dev can usually reach the host resolved by Expo.
  if (!Constants.isDevice) {
    const host = getDevHost();
    return `http://${host}:3000/api`;
  }

  return FALLBACK_DEV_API_URL;
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? getDevBaseUrl() : "https://your-production-api.com/api",
  TIMEOUT: 30000,
};

// Notes:
// - Physical device on LAN: uses Metro host IP (e.g. http://192.168.1.8:3000/api)
// - Android emulator: http://10.0.2.2:3000/api
// - If Metro runs in tunnel mode, set a fixed API URL manually.

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
  },
  PEOPLE: "/people",
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
