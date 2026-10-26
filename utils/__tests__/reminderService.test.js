import { DEFAULT_REMINDER } from "../reminders";

const makeNotifications = () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: "daily" },
});

// The service remembers whether expo-notifications could be loaded, so every
// test gets a fresh copy of it, with its own platform and notifications module.
const loadService = ({ os = "ios", notifications = makeNotifications(), missing = false } = {}) => {
  jest.resetModules();
  const { Platform } = require("react-native");
  Platform.OS = os;
  if (missing) {
    jest.doMock("expo-notifications", () => {
      throw new Error("Cannot find native module 'ExpoTopicSubscriptionModule'");
    });
  } else {
    jest.doMock("expo-notifications", () => notifications);
  }
  const storageModule = require("@react-native-async-storage/async-storage");
  return {
    service: require("../reminderService"),
    notifications,
    AsyncStorage: storageModule.default || storageModule,
  };
};

const on = { enabled: true, hour: 21, minute: 15 };

describe("reminderService", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.dontMock("expo-notifications");
  });

  it("does not load expo-notifications until it is needed", () => {
    const { notifications } = loadService();
    expect(notifications.setNotificationHandler).not.toHaveBeenCalled();
  });

  it("schedules one daily notification at the chosen time and saves it", async () => {
    const { service, notifications } = loadService();

    const result = await service.applyReminder(on);

    expect(result).toEqual({ success: true });
    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("daily-reminder");
    const request = notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(request.identifier).toBe("daily-reminder");
    expect(request.trigger).toMatchObject({ type: "daily", hour: 21, minute: 15 });
    expect(await service.loadReminder()).toEqual(on);
  });

  it("only cancels when the reminder is turned off", async () => {
    const { service, notifications } = loadService();

    const result = await service.applyReminder({ ...on, enabled: false });

    expect(result.success).toBe(true);
    expect(notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect((await service.loadReminder()).enabled).toBe(false);
  });

  it("asks for permission and stays off when it is denied", async () => {
    const notifications = makeNotifications();
    notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });
    const { service } = loadService({ notifications });

    const result = await service.applyReminder(on);

    expect(result).toEqual({ success: false, error: service.PERMISSION_MESSAGE });
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect((await service.loadReminder()).enabled).toBe(false);
  });

  it("does not ask again when permission was already granted", async () => {
    const { service, notifications } = loadService();
    await service.applyReminder(on);
    expect(notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("creates the Android channel before scheduling", async () => {
    const { service, notifications } = loadService({ os: "android" });
    await service.applyReminder(on);
    expect(notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      "daily-reminder",
      expect.objectContaining({ name: "Recordatorio diario", importance: 3 }),
    );
  });

  it("shows the reminder as a banner while the app is open", async () => {
    const { service, notifications } = loadService();
    expect(service.isReminderSupported()).toBe(true);

    const { handleNotification } = notifications.setNotificationHandler.mock.calls[0][0];
    expect(await handleNotification()).toMatchObject({
      shouldShowBanner: true,
      shouldPlaySound: false,
    });
  });

  it("is not available on web", async () => {
    const { service, notifications } = loadService({ os: "web" });

    expect(service.isReminderSupported()).toBe(false);
    expect(await service.applyReminder(on)).toEqual({
      success: false,
      error: service.UNSUPPORTED_MESSAGE,
    });
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("survives a missing native module, as in Expo Go", async () => {
    const { service } = loadService({ missing: true });

    expect(service.isReminderSupported()).toBe(false);
    expect(await service.applyReminder(on)).toEqual({
      success: false,
      error: service.UNSUPPORTED_MESSAGE,
    });
    expect(service.UNSUPPORTED_MESSAGE).toMatch(/Expo Go/);
  });

  it("importing the service never touches expo-notifications", () => {
    expect(() => loadService({ missing: true })).not.toThrow();
  });

  it("reports a scheduling failure in Spanish", async () => {
    const notifications = makeNotifications();
    notifications.scheduleNotificationAsync.mockRejectedValue(new Error("boom"));
    const { service } = loadService({ notifications });

    const result = await service.applyReminder(on);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No se pudo programar/);
  });

  it("loads the defaults when nothing is saved or the saved value is corrupt", async () => {
    const { service, AsyncStorage } = loadService();
    expect(await service.loadReminder()).toEqual(DEFAULT_REMINDER);
    await AsyncStorage.setItem("reminderSettings", "{no es json");
    expect(await service.loadReminder()).toEqual(DEFAULT_REMINDER);
  });
});
