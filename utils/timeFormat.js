// Times are always shown as hh:mm am/pm, with am and pm in lowercase
// ("08:05 am", "12:30 pm"), so every screen reads the same.

const pad2 = (n) => String(n).padStart(2, "0");

// From an hour (0 to 23) and a minute.
export const formatClockParts = (hour, minute) =>
  `${pad2(hour % 12 || 12)}:${pad2(minute)} ${hour >= 12 ? "pm" : "am"}`;

// From a Date or anything `new Date()` accepts; "" when it is not a time.
export const formatClock = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatClockParts(date.getHours(), date.getMinutes());
};
