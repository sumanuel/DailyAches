import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_REMINDER,
  REMINDER_BODY,
  REMINDER_TITLE,
  normalizeReminder,
} from "./reminders";

const STORAGE_KEY = "reminderSettings";
const REMINDER_ID = "daily-reminder";
const CHANNEL_ID = "daily-reminder";

export const UNSUPPORTED_MESSAGE =
  "Los recordatorios no están disponibles en Expo Go ni en el navegador: funcionan en la app instalada.";
export const PERMISSION_MESSAGE =
  "Para recibir el recordatorio, permite las notificaciones de DailyAches en los ajustes del teléfono.";

// expo-notifications needs a native module that Expo Go does not include, and
// importing the package without it crashes the whole app at start. It is
// therefore loaded the first time it is needed, and a missing module just
// means "reminders are not available here".
let notifications; // undefined = not tried yet, null = not available
const getNotifications = () => {
  if (notifications !== undefined) return notifications;
  if (Platform.OS === "web") {
    notifications = null;
    return notifications;
  }
  try {
    const module = require("expo-notifications");
    // Show the reminder as a banner even if the app happens to be open.
    module.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    notifications = module;
  } catch (error) {
    console.warn("expo-notifications is not available:", error?.message);
    notifications = null;
  }
  return notifications;
};

export const isReminderSupported = () => getNotifications() !== null;

// Settings are per device (the notification belongs to this phone).
export const loadReminder = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? normalizeReminder(JSON.parse(raw)) : DEFAULT_REMINDER;
  } catch {
    return DEFAULT_REMINDER;
  }
};

const saveReminder = (reminder) =>
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminder));

const ensurePermission = async (api) => {
  const current = await api.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await api.requestPermissionsAsync();
  return requested.granted;
};

// Saves the reminder and schedules (or cancels) the daily notification.
// Returns { success, error } with the error ready to show.
export const applyReminder = async (value) => {
  const reminder = normalizeReminder(value);
  const api = getNotifications();

  if (!api) {
    return { success: false, error: UNSUPPORTED_MESSAGE };
  }

  try {
    await api.cancelScheduledNotificationAsync(REMINDER_ID);

    if (reminder.enabled) {
      if (!(await ensurePermission(api))) {
        await saveReminder({ ...reminder, enabled: false });
        return { success: false, error: PERMISSION_MESSAGE };
      }

      if (Platform.OS === "android") {
        await api.setNotificationChannelAsync(CHANNEL_ID, {
          name: "Recordatorio diario",
          importance: api.AndroidImportance.DEFAULT,
        });
      }

      await api.scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: { title: REMINDER_TITLE, body: REMINDER_BODY },
        trigger: {
          type: api.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: CHANNEL_ID,
        },
      });
    }

    await saveReminder(reminder);
    return { success: true };
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    return {
      success: false,
      error: "No se pudo programar el recordatorio. Inténtalo de nuevo.",
    };
  }
};
