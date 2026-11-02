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
