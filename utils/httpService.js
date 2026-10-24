import { API_CONFIG, HTTP_STATUS, API_ERRORS } from "../constants/api";
import { translateApiError } from "./apiErrors";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base HTTP Service
class HttpService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.authToken = null;
    this.onUnauthorized = null;
  }

  // Called when a request made with a stored token comes back 401 (expired
  // or revoked session). Login/register 401s are bad credentials, not expiry.
  setUnauthorizedHandler(handler) {
    this.onUnauthorized = typeof handler === "function" ? handler : null;
  }

  setAuthToken(token) {
    this.authToken = token || null;
  }

  removeAuthToken() {
    this.authToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    if (__DEV__) {
      console.log("HTTP Request:", options.method || "GET", url);
    }
    const config = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token =
      this.authToken ||
      (await AsyncStorage.getItem("authToken").catch(() => null));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add body for POST/PUT/PATCH requests
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      const result = await this.handleResponse(response);
      if (
        result.status === HTTP_STATUS.UNAUTHORIZED &&
        token &&
        !endpoint.startsWith("/auth/login") &&
        !endpoint.startsWith("/auth/register")
      ) {
        this.onUnauthorized?.();
      }
      return result;
    } catch (error) {
      return this.handleError(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async handleResponse(response) {
    const { status } = response;

    if (status >= HTTP_STATUS.OK && status < HTTP_STATUS.BAD_REQUEST) {
      try {
        const data = await response.json();
        return { success: true, data, status };
      } catch {
        return { success: true, data: null, status };
      }
    }

    // Handle error responses
    let rawError = "";
    try {
      const errorData = await response.json();
      rawError = errorData.statusMessage || errorData.message || "";
    } catch {
      // No readable body: the status alone picks the message
    }

    // `error` is what the user reads (Spanish); `rawError` is the API's text.
    return {
      success: false,
      error: translateApiError(rawError, status),
      rawError,
      status,
    };
  }

  handleError(error) {
    if (error.name === "AbortError") {
      return {
        success: false,
        error: "La solicitud tardó demasiado tiempo. Inténtalo de nuevo.",
      };
    }

    // fetch rejects with a different text on each platform when there is no connection
    const message = String(error?.message || "");
    if (
      error instanceof TypeError ||
      /network request failed|failed to fetch|load failed|networkerror/i.test(message)
    ) {
      return {
        success: false,
        error: API_ERRORS.NETWORK_ERROR,
      };
    }

    // Never show a raw (English) exception message to the user.
    return {
      success: false,
      error: API_ERRORS.UNKNOWN_ERROR,
    };
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body: data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body: data });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export default new HttpService();
