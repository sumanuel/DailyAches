import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  PERMISSION_MESSAGE,
  UNSUPPORTED_MESSAGE,
  applyReminder,
  loadReminder,
} from "../reminderService";
import { DEFAULT_REMINDER } from "../reminders";

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

const on = { enabled: true, hour: 21, minute: 15 };

describe("reminderService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    Platform.OS = "ios";
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true });
  });

  it("schedules one daily notification at the chosen time and saves it", async () => {
    const result = await applyReminder(on);

    expect(result).toEqual({ success: true });
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("daily-reminder");
    const request = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(request.identifier).toBe("daily-reminder");
    expect(request.trigger).toMatchObject({ type: "daily", hour: 21, minute: 15 });
    expect(await loadReminder()).toEqual(on);
  });

  it("only cancels when the reminder is turned off", async () => {
    const result = await applyReminder({ ...on, enabled: false });

    expect(result.success).toBe(true);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect((await loadReminder()).enabled).toBe(false);
  });

  it("asks for permission and stays off when it is denied", async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });

    const result = await applyReminder(on);

    expect(result).toEqual({ success: false, error: PERMISSION_MESSAGE });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect((await loadReminder()).enabled).toBe(false);
  });

  it("does not ask again when permission was already granted", async () => {
    await applyReminder(on);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("creates the Android channel before scheduling", async () => {
    Platform.OS = "android";
    await applyReminder(on);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "daily-reminder",
      expect.objectContaining({ name: "Recordatorio diario" }),
    );
  });

  it("is not available on web", async () => {
    Platform.OS = "web";
    const result = await applyReminder(on);

    expect(result).toEqual({ success: false, error: UNSUPPORTED_MESSAGE });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("reports a scheduling failure in Spanish", async () => {
    Notifications.scheduleNotificationAsync.mockRejectedValue(new Error("boom"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await applyReminder(on);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No se pudo programar/);
  });

  it("shows the reminder as a banner while the app is open", async () => {
    // registered once, when the module loaded (before clearAllMocks)
    expect(Notifications.setNotificationHandler).toBeDefined();
    jest.isolateModules(() => {
      require("../reminderService");
    });
    const { handleNotification } = Notifications.setNotificationHandler.mock.calls[0][0];
    expect(await handleNotification()).toMatchObject({
      shouldShowBanner: true,
      shouldPlaySound: false,
    });
  });

  it("loads the defaults when nothing is saved or the saved value is corrupt", async () => {
    expect(await loadReminder()).toEqual(DEFAULT_REMINDER);
    await AsyncStorage.setItem("reminderSettings", "{no es json");
    expect(await loadReminder()).toEqual(DEFAULT_REMINDER);
  });
});
