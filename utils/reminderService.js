import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
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
  "Los recordatorios solo funcionan en la app del móvil.";
export const PERMISSION_MESSAGE =
  "Para recibir el recordatorio, permite las notificaciones de DailyAches en los ajustes del teléfono.";

export const isReminderSupported = () => Platform.OS !== "web";

// Show the reminder as a banner even if the app happens to be open.
if (isReminderSupported()) {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

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

const ensurePermission = async () => {
  const current = await getPermissionsAsync();
  if (current.granted) return true;
  const requested = await requestPermissionsAsync();
  return requested.granted;
};

// Saves the reminder and schedules (or cancels) the daily notification.
// Returns { success, error } with the error ready to show.
export const applyReminder = async (value) => {
  const reminder = normalizeReminder(value);

  if (!isReminderSupported()) {
    return { success: false, error: UNSUPPORTED_MESSAGE };
  }

  try {
    await cancelScheduledNotificationAsync(REMINDER_ID);

    if (reminder.enabled) {
      if (!(await ensurePermission())) {
        await saveReminder({ ...reminder, enabled: false });
        return { success: false, error: PERMISSION_MESSAGE };
      }

      if (Platform.OS === "android") {
        await setNotificationChannelAsync(CHANNEL_ID, {
          name: "Recordatorio diario",
          importance: AndroidImportance.DEFAULT,
        });
      }

      await scheduleNotificationAsync({
        identifier: REMINDER_ID,
        content: { title: REMINDER_TITLE, body: REMINDER_BODY },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
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
