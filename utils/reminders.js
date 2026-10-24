// The daily reminder: when it fires and how it is described. Pure helpers; the
// notification scheduling itself lives in reminderService.js.

export const DEFAULT_REMINDER = { enabled: false, hour: 20, minute: 0 };

export const REMINDER_TITLE = "DailyAches";
export const REMINDER_BODY = "¿Hubo algún dolor hoy? Anótalo en un momento.";

const toInt = (value, fallback, min, max) => {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

// Anything read from storage goes through here, so a corrupt value cannot
// schedule a notification at an impossible time.
export const normalizeReminder = (value) => ({
  enabled: value?.enabled === true,
  hour: toInt(value?.hour, DEFAULT_REMINDER.hour, 0, 23),
  minute: toInt(value?.minute, DEFAULT_REMINDER.minute, 0, 59),
});

const pad2 = (n) => String(n).padStart(2, "0");

export const formatReminderTime = ({ hour, minute }) =>
  `${pad2(hour)}:${pad2(minute)}`;

export const describeReminder = (reminder) =>
  reminder.enabled
    ? `Todos los días a las ${formatReminderTime(reminder)}`
    : "Desactivado";

// The time pickers work with Date objects.
export const reminderToDate = ({ hour, minute }, base = new Date()) => {
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const dateToReminder = (date, previous = DEFAULT_REMINDER) =>
  normalizeReminder({
    ...previous,
    hour: date.getHours(),
    minute: date.getMinutes(),
  });
