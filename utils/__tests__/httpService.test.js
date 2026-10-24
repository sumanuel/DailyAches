import AsyncStorage from "@react-native-async-storage/async-storage";
import HttpService from "../httpService";

const jsonResponse = (status, body) => ({
  status,
  json: async () => body,
});

describe("HttpService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    HttpService.removeAuthToken();
    HttpService.setUnauthorizedHandler(null);
    global.fetch = jest.fn();
  });

  it("returns data on success and sends the stored Bearer token", async () => {
    await AsyncStorage.setItem("authToken", "abc");
    global.fetch.mockResolvedValue(jsonResponse(200, { people: [] }));

    const result = await HttpService.get("/people");

    expect(result).toEqual({ success: true, data: { people: [] }, status: 200 });
    const [url, config] = global.fetch.mock.calls[0];
    expect(url.endsWith("/api/people")).toBe(true);
    expect(config.headers.Authorization).toBe("Bearer abc");
  });

  it("returns a Spanish error and keeps the raw one without throwing", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(400, { message: "Nombre requerido" }),
    );

    const result = await HttpService.post("/people", {});

    expect(result).toEqual({
      success: false,
      error: "Revisa los datos e inténtalo de nuevo.",
      rawError: "Nombre requerido",
      status: 400,
    });
  });

  it("calls the unauthorized handler on a 401 made with a token", async () => {
    const handler = jest.fn();
    HttpService.setUnauthorizedHandler(handler);
    HttpService.setAuthToken("expired");
    global.fetch.mockResolvedValue(jsonResponse(401, { message: "Token" }));

    const result = await HttpService.get("/people");

    expect(result.success).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call the handler for a 401 without a token", async () => {
    const handler = jest.fn();
    HttpService.setUnauthorizedHandler(handler);
    global.fetch.mockResolvedValue(jsonResponse(401, {}));

    await HttpService.get("/people");

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not call the handler for a 401 on login", async () => {
    const handler = jest.fn();
    HttpService.setUnauthorizedHandler(handler);
    HttpService.setAuthToken("tok");
    global.fetch.mockResolvedValue(jsonResponse(401, {}));

    await HttpService.post("/auth/login", { email: "a", password: "b" });

    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    ["Network request failed", Error],
    ["Failed to fetch", TypeError],
    ["Load failed", TypeError],
  ])("maps the network failure %s to a friendly message", async (message, ErrorType) => {
    global.fetch.mockRejectedValue(new ErrorType(message));

    const result = await HttpService.get("/people");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/conexi/i);
  });

  it("never exposes a raw exception message", async () => {
    global.fetch.mockRejectedValue(new Error("Unexpected token < in JSON"));

    const result = await HttpService.get("/people");

    expect(result.error).toBe("Ha ocurrido un error desconocido.");
  });

  it("translates the API's English messages", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(401, { statusMessage: "Invalid credentials" }),
    );

    const result = await HttpService.post("/auth/login", {});

    expect(result.error).toBe("El correo o la contraseña no son correctos.");
    expect(result.rawError).toBe("Invalid credentials");
  });
});
