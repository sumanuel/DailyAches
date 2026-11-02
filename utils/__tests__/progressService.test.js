import AsyncStorage from "@react-native-async-storage/async-storage";
import HttpService from "../httpService";
import ProgressService from "../progressService";
import RecordsService from "../recordsService";

const jsonResponse = (status, body) => ({ status, json: async () => body });

const serverProgress = {
  points: 25,
  level: 1,
  records_count: 1,
  unlocked_achievements: [{ id: 1, unlocked_at: "2026-11-02T10:00:00.000Z" }],
};

describe("ProgressService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    HttpService.removeAuthToken();
    HttpService.setUnauthorizedHandler(null);
    global.fetch = jest.fn();
  });

  it("reads the progress from GET /progress", async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, { progress: serverProgress }));

    const result = await ProgressService.getProgress();

    expect(result.success).toBe(true);
    expect(result.progress.points).toBe(25);
    expect(result.progress.recordsCount).toBe(1);
    const [url, config] = global.fetch.mock.calls[0];
    expect(url.endsWith("/api/progress")).toBe(true);
    expect(config.method).toBe("GET");
  });

  it("claims an achievement with POST /progress/achievements/:id", async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, { progress: serverProgress }));

    const result = await ProgressService.claimAchievement(12);

    expect(result.success).toBe(true);
    const [url, config] = global.fetch.mock.calls[0];
    expect(url.endsWith("/api/progress/achievements/12")).toBe(true);
    expect(config.method).toBe("POST");
  });

  it("passes failures through with a Spanish message", async () => {
    global.fetch.mockResolvedValue(jsonResponse(500, { statusMessage: "boom" }));

    const result = await ProgressService.getProgress();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/servidor/i);
  });

  it("does not trust an answer without usable progress", async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, { progress: { nope: true } }));

    const result = await ProgressService.getProgress();

    expect(result.success).toBe(false);
    expect(result.error).toBe("No se pudo leer tu progreso.");
  });
});

describe("RecordsService.createRecord", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("hands back the progress the server sends with the new record", async () => {
    global.fetch.mockResolvedValue(
      jsonResponse(200, { record: { id: "9" }, progress: serverProgress }),
    );

    const result = await RecordsService.createRecord({ person_id: 1, pain_type_id: 2, pain_level: 4 });

    expect(result.success).toBe(true);
    expect(result.record).toEqual({ id: "9" });
    expect(result.progress).toEqual(serverProgress);
  });

  it("still works against a server that sends no progress", async () => {
    global.fetch.mockResolvedValue(jsonResponse(200, { record: { id: "9" } }));

    const result = await RecordsService.createRecord({ person_id: 1, pain_type_id: 2, pain_level: 4 });

    expect(result.success).toBe(true);
    expect(result.progress).toBeUndefined();
  });
});
