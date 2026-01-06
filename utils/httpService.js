import { API_CONFIG, HTTP_STATUS, API_ERRORS } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base HTTP Service
class HttpService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.authToken = null;
  }

  setAuthToken(token) {
    this.authToken = token || null;
  }

  removeAuthToken() {
    this.authToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log("HTTP Request:", options.method || "GET", url); // Agregar log
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
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
    let errorMessage = API_ERRORS.UNKNOWN_ERROR;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.statusMessage || errorData.message || errorMessage;
    } catch {
      // Use default error message
    }

    return {
      success: false,
      error: errorMessage,
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

    if (error.message === "Network request failed") {
      return {
        success: false,
        error: API_ERRORS.NETWORK_ERROR,
      };
    }

    return {
      success: false,
      error: error.message || API_ERRORS.UNKNOWN_ERROR,
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
