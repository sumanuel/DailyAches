// Statistics for a week, month or year of records, plus the comparison with
// the previous period. Pure functions: the screen only renders their result.

import { dayKey, filterRecords, getPainTypeOptions } from "./recordFilters";

export const PERIODS = ["week", "month", "year"];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEKDAYS_MON_FIRST = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

const pad2 = (n) => String(n).padStart(2, "0");

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const daysBetween = (start, end) =>
  Math.round((startOfDay(end) - startOfDay(start)) / MS_PER_DAY) + 1;

// `offset` 0 is the current period, -1 the previous one, and so on.
export const getPeriodRange = (period, offset = 0, now = new Date()) => {
  let start;
  let end;
  let label;

  if (period === "week") {
    start = startOfDay(now);
    const day = start.getDay();
    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day) + offset * 7);
    end = endOfDay(start);
    end.setDate(end.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    label = sameMonth
      ? `${pad2(start.getDate())} – ${pad2(end.getDate())} ${
          MONTHS_SHORT[end.getMonth()]
        } ${end.getFullYear()}`
      : `${pad2(start.getDate())} ${MONTHS_SHORT[start.getMonth()]} – ${pad2(
          end.getDate(),
        )} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  } else if (period === "year") {
    const year = now.getFullYear() + offset;
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31, 23, 59, 59, 999);
    label = String(year);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    label = `${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`;
  }

  const days = daysBetween(start, end);
  // A period still in progress only counts the days that have happened.
  const elapsedDays = Math.max(
    0,
    Math.min(days, daysBetween(start, now)),
  );
  return { start, end, label, days, elapsedDays };
};

export const computeSummary = (records, range) => {
  const inRange = filterRecords(records, { start: range.start, end: range.end });
  const levels = inRange
    .map((record) => Number(record.painLevel))
    .filter((level) => Number.isFinite(level) && level > 0);
  const average = levels.length
    ? Math.round((levels.reduce((sum, n) => sum + n, 0) / levels.length) * 10) / 10
    : null;
  const activeDays = new Set(inRange.map((record) => dayKey(record.createdAt)))
    .size;
  const topPain = getPainTypeOptions(inRange)[0] || null;

  return {
    records: inRange,
    count: inRange.length,
    averageLevel: average,
    activeDays,
    totalDays: range.elapsedDays,
    topPain,
  };
};

export const compareSummaries = (current, previous) => ({
  countDelta: current.count - previous.count,
  averageDelta:
    current.averageLevel !== null && previous.averageLevel !== null
      ? Math.round((current.averageLevel - previous.averageLevel) * 10) / 10
      : null,
  hasPrevious: previous.count > 0,
});

export const describeCountChange = (comparison) => {
  if (!comparison.hasPrevious) return "Sin registros en el periodo anterior";
  if (comparison.countDelta === 0) return "Igual que el periodo anterior";
  const amount = Math.abs(comparison.countDelta);
  return `${amount} ${comparison.countDelta > 0 ? "más" : "menos"} que el periodo anterior`;
};

export const describeAverageChange = (comparison) => {
  if (comparison.averageDelta === null) return "";
  if (comparison.averageDelta === 0) return "Igual que el periodo anterior";
  const amount = String(Math.abs(comparison.averageDelta)).replace(".", ",");
  return `${amount} ${comparison.averageDelta > 0 ? "más alta" : "más baja"} que el periodo anterior`;
};

export const formatAverage = (value) =>
  value === null ? "–" : String(value).replace(".", ",");

// Counts for the column chart: one per day (week, month) or per month (year).
export const bucketByPeriod = (records, period, range) => {
  const inRange = filterRecords(records, { start: range.start, end: range.end });

  if (period === "year") {
    const buckets = MONTHS_SHORT.map((label, index) => ({
      key: String(index),
      label,
      count: 0,
    }));
    for (const record of inRange) {
      buckets[new Date(record.createdAt).getMonth()].count += 1;
    }
    return buckets;
  }

  const buckets = [];
  const cursor = startOfDay(range.start);
  for (let i = 0; i < range.days; i++) {
    buckets.push({
      key: dayKey(cursor),
      label:
        period === "week"
          ? WEEKDAYS_MON_FIRST[i]
          : String(cursor.getDate()),
      count: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const record of inRange) {
    const bucket = byKey.get(dayKey(record.createdAt));
    if (bucket) bucket.count += 1;
  }
  return buckets;
};

export const countByPerson = (records, people) => {
  const names = new Map((people || []).map((p) => [p.id, p.name]));
  const byId = new Map();
  for (const record of records || []) {
    const key = record.personId || record.personName;
    if (!key) continue;
    const entry = byId.get(key) || {
      key,
      name: names.get(record.personId) || record.personName || "Sin nombre",
      count: 0,
    };
    entry.count += 1;
    byId.set(key, entry);
  }
  return [...byId.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"),
  );
};
