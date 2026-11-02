import { MONTHS_ES } from "./recordFilters";

// When a pain episode happened. "Ahora" sends no date (the API uses its own
// clock); the other options go back whole days at the current time of day, so
// they are always in the past, which is what the API accepts.
export const RECORD_DATE_OPTIONS = [
  { key: "now", label: "Ahora", daysAgo: 0 },
  { key: "yesterday", label: "Ayer", daysAgo: 1 },
  { key: "twoDays", label: "Hace 2 días", daysAgo: 2 },
  { key: "threeDays", label: "Hace 3 días", daysAgo: 3 },
];

export const DEFAULT_RECORD_DATE = RECORD_DATE_OPTIONS[0].key;

// The `created_at` to send for an option, or undefined when it is "now".
export const createdAtForOption = (key, now = new Date()) => {
  const option = RECORD_DATE_OPTIONS.find((entry) => entry.key === key);
  if (!option || option.daysAgo === 0) return undefined;
  const date = new Date(now);
  date.setDate(date.getDate() - option.daysAgo);
  return date.toISOString();
};

// "Otra fecha": any past moment the person picks (the API accepts 2000-01-01
// up to now).
export const CUSTOM_DATE_KEY = "custom";
const MIN_CUSTOM_DATE = new Date(2000, 0, 1);

const pad2 = (n) => String(n).padStart(2, "0");

const isValidDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());

// What to send for the current choice: { createdAt } (absent for "now") or
// { error } in Spanish when the custom date cannot be used.
export const resolveRecordDate = (
  { option = DEFAULT_RECORD_DATE, customDate = null } = {},
  now = new Date(),
) => {
  if (option !== CUSTOM_DATE_KEY) {
    return { createdAt: createdAtForOption(option, now) };
  }
  if (!isValidDate(customDate)) {
    return { error: "Elige la fecha y la hora." };
  }
  if (customDate.getTime() > now.getTime()) {
    return { error: "Esa fecha todavía no llega." };
  }
  if (customDate.getTime() < MIN_CUSTOM_DATE.getTime()) {
    return { error: "Esa fecha es demasiado antigua." };
  }
  return { createdAt: customDate.toISOString() };
};

// Value of an <input type="datetime-local"> (local time, no seconds) and back.
export const toDateTimeLocalValue = (date) =>
  isValidDate(date)
    ? `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
    : "";

export const fromDateTimeLocalValue = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value || "")) return null;
  const date = new Date(value);
  return isValidDate(date) ? date : null;
};

// "12 oct 2026, 18:30"
export const formatCustomDate = (date) =>
  isValidDate(date)
    ? `${date.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
    : "";
