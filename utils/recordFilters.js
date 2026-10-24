// Pure helpers behind the per-person history: filtering, grouping by day and
// the labels shown on each group. Records use the app shape from apiMappers.

const WEEKDAYS_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS_ES = [
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

const pad2 = (n) => String(n).padStart(2, "0");

// "Cabeza", "cabeza" and "CÁBEZA" all match the same search.
export const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const matchesPainType = (record, painTypeKey) => {
  if (!painTypeKey) return true;
  return (record.painTypeId || record.pain) === painTypeKey;
};

const matchesQuery = (record, query) => {
  const needle = normalizeText(query);
  if (!needle) return true;
  return (
    normalizeText(record.notes).includes(needle) ||
    normalizeText(record.pain).includes(needle)
  );
};

// Newest first. `start`/`end` are Date objects (inclusive) and optional.
export const filterRecords = (
  records,
  { personId, start, end, painTypeKey, query } = {},
) => {
  const from = start ? new Date(start).getTime() : -Infinity;
  const to = end ? new Date(end).getTime() : Infinity;
  return (records || [])
    .filter((record) => {
      if (personId && record.personId !== personId) return false;
      const time = new Date(record.createdAt).getTime();
      if (Number.isNaN(time) || time < from || time > to) return false;
      return matchesPainType(record, painTypeKey) && matchesQuery(record, query);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Pain types present in `records`, most frequent first, for the filter chips.
export const getPainTypeOptions = (records) => {
  const byKey = new Map();
  for (const record of records || []) {
    const key = record.painTypeId || record.pain;
    if (!key) continue;
    const current = byKey.get(key) || { key, name: record.pain, count: 0 };
    current.count += 1;
    byKey.set(key, current);
  }
  return [...byKey.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"),
  );
};

// Consecutive records that share a calendar day end up in the same group, so
// feed it a list already sorted by date.
export const groupRecordsByDay = (records) => {
  const groups = [];
  for (const record of records || []) {
    const key = dayKey(record.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.records.push(record);
    } else {
      groups.push({ key, date: record.createdAt, records: [record] });
    }
  }
  return groups;
};

export const formatDayHeader = (date, now = new Date()) => {
  const d = new Date(date);
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) return "Hoy";
  if (dayKey(d) === dayKey(yesterday)) return "Ayer";
  return `${WEEKDAYS_ES[d.getDay()]} ${pad2(d.getDate())} ${
    MONTHS_ES[d.getMonth()]
  } ${d.getFullYear()}`;
};

// Puts a record back where it belongs (newest first) after an undone delete.
export const insertRecordSorted = (records, record) =>
  [...(records || []), record].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
