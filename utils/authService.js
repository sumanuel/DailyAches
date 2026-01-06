import AsyncStorage from "@react-native-async-storage/async-storage";
import HttpService from "./httpService";
import { API_ENDPOINTS } from "../constants/api";

class AuthService {
  // Login user
  async login(email, password) {
    const response = await HttpService.post(API_ENDPOINTS.AUTH.LOGIN, {
      email: email.trim().toLowerCase(),
      password,
    });

    if (response.success) {
      // Store token if login successful
      if (response.data?.token) {
        await this.setAuthToken(response.data.token);
      }
      return {
        success: true,
        user: response.data?.user,
        token: response.data?.token,
      };
    }

    return response;
  }

  // Register new user
  async register(email, password, name = null) {
    const response = await HttpService.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: email.trim().toLowerCase(),
      password,
      name,
    });

    if (response.success) {
      // Store token if registration successful
      if (response.data?.token) {
        await this.setAuthToken(response.data.token);
      }
      return {
        success: true,
        user: response.data?.user,
        token: response.data?.token,
      };
    }

    return response;
  }

  // Get current user info
  async getCurrentUser() {
    const response = await HttpService.get(API_ENDPOINTS.AUTH.ME);

    if (response.success) {
      return {
        success: true,
        user: response.data?.user,
      };
    }

    return response;
  }

  // Logout user
  async logout() {
    await this.removeAuthToken();
    return { success: true };
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getAuthToken();
    if (!token) return false;

    // Verify token by calling /me endpoint
    const response = await this.getCurrentUser();
    return response.success;
  }

  // Token management (will be integrated with AsyncStorage)
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
      // Update HttpService token
      HttpService.setAuthToken(token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
      // Clear HttpService token
      HttpService.removeAuthToken();
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }
}

export default new AuthService();
