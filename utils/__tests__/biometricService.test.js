const makeModules = (overrides = {}) => ({
  auth: {
    hasHardwareAsync: jest.fn().mockResolvedValue(true),
    isEnrolledAsync: jest.fn().mockResolvedValue(true),
    ...overrides.auth,
  },
  store: {
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    getItemAsync: jest.fn().mockResolvedValue(null),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined),
    ...overrides.store,
  },
});

// The service remembers whether the native modules could be loaded, so every
// test gets a fresh copy with its own platform and modules.
const loadService = ({ os = "android", overrides, missing = false } = {}) => {
  jest.resetModules();
  const { Platform } = require("react-native");
  Platform.OS = os;
  const native = makeModules(overrides);
  if (missing) {
    jest.doMock("expo-local-authentication", () => {
      throw new Error("Cannot find native module 'ExpoLocalAuthentication'");
    });
  } else {
    jest.doMock("expo-local-authentication", () => native.auth);
  }
  jest.doMock("expo-secure-store", () => native.store);
  const storageModule = require("@react-native-async-storage/async-storage");
  return {
    service: require("../biometricService"),
    native,
    AsyncStorage: storageModule.default || storageModule,
  };
};

describe("describeBiometricError", () => {
  const { describeBiometricError } = loadService().service;

  it("treats a cancelled prompt as silent", () => {
    for (const error of [
      { code: "ERR_USER_CANCEL" },
      { message: "User canceled the authentication" },
      { message: "Negative button pressed" },
    ]) {
      expect(describeBiometricError(error)).toMatchObject({ cancelled: true, message: "" });
    }
  });

  it("asks to reset when the saved key stopped working", () => {
    const result = describeBiometricError({
      message: "Could not decrypt the item in SecureStore",
    });
    expect(result.reset).toBe(true);
    expect(result.message).toMatch(/huella del teléfono cambió/);
  });

  it("falls back to a generic message", () => {
    const result = describeBiometricError(new Error("boom"));
    expect(result).toMatchObject({ cancelled: false, reset: false });
    expect(result.message).toMatch(/Entra con tu contraseña/);
  });
});

describe("biometricService", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  describe("isBiometricSupported", () => {
    it("needs the sensor and an enrolled fingerprint", async () => {
      expect(await loadService().service.isBiometricSupported()).toBe(true);
      expect(
        await loadService({
          overrides: { auth: { isEnrolledAsync: jest.fn().mockResolvedValue(false) } },
        }).service.isBiometricSupported(),
      ).toBe(false);
      expect(
        await loadService({
          overrides: { auth: { hasHardwareAsync: jest.fn().mockResolvedValue(false) } },
        }).service.isBiometricSupported(),
      ).toBe(false);
    });

    it("is off on web and when the module is missing", async () => {
      expect(await loadService({ os: "web" }).service.isBiometricSupported()).toBe(false);
      expect(await loadService({ missing: true }).service.isBiometricSupported()).toBe(false);
    });

    it("is off when asking the phone fails", async () => {
      const { service } = loadService({
        overrides: { auth: { hasHardwareAsync: jest.fn().mockRejectedValue(new Error("x")) } },
      });
      expect(await service.isBiometricSupported()).toBe(false);
    });
  });

  describe("saveCredentials", () => {
    it("stores them behind the fingerprint and remembers the email", async () => {
      const { service, native, AsyncStorage } = loadService();
      await AsyncStorage.clear();
      expect(await service.saveCredentials("ana@example.com", "secreta1")).toEqual({
        success: true,
      });
      expect(native.store.setItemAsync).toHaveBeenCalledWith(
        "biometricCredentials",
        JSON.stringify({ email: "ana@example.com", password: "secreta1" }),
        expect.objectContaining({ requireAuthentication: true }),
      );
      expect(await service.getSavedEmail()).toBe("ana@example.com");
    });

    it("saves nothing when the phone refuses", async () => {
      const { service, AsyncStorage } = loadService({
        overrides: { store: { setItemAsync: jest.fn().mockRejectedValue(new Error("nope")) } },
      });
      await AsyncStorage.clear();
      const result = await service.saveCredentials("ana@example.com", "secreta1");
      expect(result.success).toBe(false);
      expect(result.error).toBe(service.SAVE_FAILED_MESSAGE);
      expect(await service.getSavedEmail()).toBeNull();
    });

    it("stays quiet when the prompt is cancelled", async () => {
      const { service } = loadService({
        overrides: {
          store: { setItemAsync: jest.fn().mockRejectedValue({ code: "ERR_USER_CANCEL" }) },
        },
      });
      const result = await service.saveCredentials("a@b.co", "x");
      expect(result).toMatchObject({ success: false, cancelled: true, error: "" });
    });

    it("is unavailable without the native modules", async () => {
      const { service } = loadService({ missing: true });
      expect((await service.saveCredentials("a@b.co", "x")).success).toBe(false);
    });
  });

  describe("readCredentials", () => {
    const saved = JSON.stringify({ email: "ana@example.com", password: "secreta1" });

    it("returns what was saved after the fingerprint", async () => {
      const { service, native } = loadService({
        overrides: { store: { getItemAsync: jest.fn().mockResolvedValue(saved) } },
      });
      expect(await service.readCredentials()).toEqual({
        success: true,
        credentials: { email: "ana@example.com", password: "secreta1" },
      });
      expect(native.store.getItemAsync).toHaveBeenCalledWith(
        "biometricCredentials",
        expect.objectContaining({ requireAuthentication: true }),
      );
    });

    it("clears the saved data when it is empty or damaged", async () => {
      for (const raw of [null, "{}", JSON.stringify({ email: "a@b.co" })]) {
        const { service, native, AsyncStorage } = loadService({
          overrides: { store: { getItemAsync: jest.fn().mockResolvedValue(raw) } },
        });
        await AsyncStorage.setItem("biometricEmail", "a@b.co");
        const result = await service.readCredentials();
        expect(result.success).toBe(false);
        expect(native.store.deleteItemAsync).toHaveBeenCalled();
        expect(await service.getSavedEmail()).toBeNull();
      }
    });

    it("does not clear anything when the prompt is cancelled", async () => {
      const { service, native, AsyncStorage } = loadService({
        overrides: {
          store: { getItemAsync: jest.fn().mockRejectedValue({ code: "ERR_USER_CANCEL" }) },
        },
      });
      await AsyncStorage.setItem("biometricEmail", "a@b.co");
      const result = await service.readCredentials();
      expect(result).toMatchObject({ success: false, cancelled: true });
      expect(native.store.deleteItemAsync).not.toHaveBeenCalled();
      expect(await service.getSavedEmail()).toBe("a@b.co");
    });

    it("clears everything when the saved key stopped working", async () => {
      const { service, native, AsyncStorage } = loadService({
        overrides: {
          store: {
            getItemAsync: jest
              .fn()
              .mockRejectedValue(new Error("Could not decrypt the item in SecureStore")),
          },
        },
      });
      await AsyncStorage.setItem("biometricEmail", "a@b.co");
      const result = await service.readCredentials();
      expect(result.error).toBe(service.CHANGED_MESSAGE);
      expect(native.store.deleteItemAsync).toHaveBeenCalled();
      expect(await service.getSavedEmail()).toBeNull();
    });
  });

  describe("clearCredentials", () => {
    it("forgets the account even if the secure store cannot delete it", async () => {
      const { service, AsyncStorage } = loadService({
        overrides: { store: { deleteItemAsync: jest.fn().mockRejectedValue(new Error("x")) } },
      });
      await AsyncStorage.setItem("biometricEmail", "a@b.co");
      await service.clearCredentials();
      expect(await service.getSavedEmail()).toBeNull();
    });
  });
});
