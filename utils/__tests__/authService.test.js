import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../authService";
import HttpService from "../httpService";

const jsonResponse = (status, body) => ({ status, json: async () => body });

describe("AuthService account actions", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    HttpService.removeAuthToken();
    HttpService.setUnauthorizedHandler(null);
    global.fetch = jest.fn();
  });

  describe("changePassword", () => {
    it("sends both passwords and keeps the fresh token", async () => {
      await AuthService.setAuthToken("old-token");
      global.fetch.mockResolvedValue(jsonResponse(200, { success: true, token: "new-token" }));

      const result = await AuthService.changePassword("secret1", "newsecret");

      expect(result).toEqual({ success: true });
      const [url, config] = global.fetch.mock.calls[0];
      expect(url.endsWith("/api/auth/password")).toBe(true);
      expect(config.method).toBe("PUT");
      expect(JSON.parse(config.body)).toEqual({
        current_password: "secret1",
        new_password: "newsecret",
      });
      expect(config.headers.Authorization).toBe("Bearer old-token");
      expect(await AsyncStorage.getItem("authToken")).toBe("new-token");
    });

    it("keeps the old token and explains a wrong password in Spanish", async () => {
      await AuthService.setAuthToken("old-token");
      global.fetch.mockResolvedValue(
        jsonResponse(403, { statusMessage: "Current password is incorrect" }),
      );

      const result = await AuthService.changePassword("nope", "newsecret");

      expect(result.success).toBe(false);
      expect(result.error).toBe("La contraseña actual no es correcta.");
      expect(await AsyncStorage.getItem("authToken")).toBe("old-token");
    });

    it("does not treat a wrong password as an expired session", async () => {
      await AuthService.setAuthToken("old-token");
      const onUnauthorized = jest.fn();
      HttpService.setUnauthorizedHandler(onUnauthorized);
      global.fetch.mockResolvedValue(
        jsonResponse(403, { statusMessage: "Current password is incorrect" }),
      );

      await AuthService.changePassword("nope", "newsecret");

      expect(onUnauthorized).not.toHaveBeenCalled();
    });
  });

  describe("deleteAccount", () => {
    it("sends the password in the body and drops the session", async () => {
      await AuthService.setAuthToken("token");
      global.fetch.mockResolvedValue(jsonResponse(200, { success: true }));

      const result = await AuthService.deleteAccount("secret1");

      expect(result).toEqual({ success: true });
      const [url, config] = global.fetch.mock.calls[0];
      expect(url.endsWith("/api/auth/account")).toBe(true);
      expect(config.method).toBe("DELETE");
      expect(JSON.parse(config.body)).toEqual({ password: "secret1" });
      expect(await AsyncStorage.getItem("authToken")).toBeNull();
    });

    it("keeps the session when the password is wrong", async () => {
      await AuthService.setAuthToken("token");
      global.fetch.mockResolvedValue(
        jsonResponse(403, { statusMessage: "Password is incorrect" }),
      );

      const result = await AuthService.deleteAccount("nope");

      expect(result.success).toBe(false);
      expect(result.error).toBe("La contraseña no es correcta.");
      expect(await AsyncStorage.getItem("authToken")).toBe("token");
    });
  });
});
