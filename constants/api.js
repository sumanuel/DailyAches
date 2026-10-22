import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PORT = 3000;

function getDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri === "string" && hostUri.length) {
    // hostUri is usually like "192.168.1.10:8081"
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
  // Preferred: set EXPO_PUBLIC_API_URL in .env (see .env.example).
  const envBaseUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Android emulator reaches the host machine through this special alias.
  if (Platform.OS === "android" && !Constants.isDevice) {
    return `http://10.0.2.2:${API_PORT}/api`;
  }

  // Physical devices, iOS simulator and web use the host Expo resolved. On
  // machines with virtual adapters (Hyper-V/WSL) that host may be unreachable
  // from a phone: set EXPO_PUBLIC_API_URL to the real LAN address instead.
  return `http://${getDevHost()}:${API_PORT}/api`;
}

const PRODUCTION_API_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? getDevBaseUrl()
    : PRODUCTION_API_URL || "https://your-production-api.com/api",
  TIMEOUT: 30000,
};

// Notes:
// - Set EXPO_PUBLIC_API_URL in .env to override the URL in any environment.
// - Android emulator default: http://10.0.2.2:3000/api
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
