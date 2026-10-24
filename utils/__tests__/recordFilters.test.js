import {
  dayKey,
  filterRecords,
  formatDayHeader,
  getPainTypeOptions,
  groupRecordsByDay,
  insertRecordSorted,
  normalizeText,
} from "../recordFilters";

const record = (id, personId, pain, painTypeId, createdAt, notes = "") => ({
  id,
  personId,
  pain,
  painTypeId,
  createdAt,
  notes,
});

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();

const records = [
  record("1", "7", "Cabeza", "1", at(2026, 10, 20), "Tras el trabajo"),
  record("2", "7", "Espalda", "2", at(2026, 10, 22, 9), "Mala postura"),
  record("3", "7", "Cabeza", "1", at(2026, 10, 22, 18), "Migraña fuerte"),
  record("4", "8", "Cabeza", "1", at(2026, 10, 22, 10), "Otra persona"),
];

describe("normalizeText", () => {
  it("ignores case and accents", () => {
    expect(normalizeText("  MIGRAÑA ")).toBe("migrana");
    expect(normalizeText(null)).toBe("");
  });
});

describe("filterRecords", () => {
  it("keeps one person and sorts newest first", () => {
    const result = filterRecords(records, { personId: "7" });
    expect(result.map((r) => r.id)).toEqual(["3", "2", "1"]);
  });

  it("applies the date range inclusively", () => {
    const result = filterRecords(records, {
      personId: "7",
      start: new Date(2026, 9, 22, 0, 0),
      end: new Date(2026, 9, 22, 23, 59, 59),
    });
    expect(result.map((r) => r.id)).toEqual(["3", "2"]);
  });

  it("filters by pain type key", () => {
    const result = filterRecords(records, { personId: "7", painTypeKey: "1" });
    expect(result.map((r) => r.id)).toEqual(["3", "1"]);
  });

  it("searches notes and pain name without caring about accents", () => {
    expect(
      filterRecords(records, { personId: "7", query: "migrana" }).map((r) => r.id),
    ).toEqual(["3"]);
    expect(
      filterRecords(records, { personId: "7", query: "ESPALDA" }).map((r) => r.id),
    ).toEqual(["2"]);
  });

  it("combines filters and tolerates bad input", () => {
    expect(
      filterRecords(records, { personId: "7", painTypeKey: "1", query: "trabajo" }),
    ).toHaveLength(1);
    expect(filterRecords(undefined, {})).toEqual([]);
    expect(
      filterRecords([record("9", "7", "X", "1", "no-es-fecha")], { personId: "7" }),
    ).toEqual([]);
  });
});

describe("getPainTypeOptions", () => {
  it("counts each pain type and orders by frequency", () => {
    expect(getPainTypeOptions(records.filter((r) => r.personId === "7"))).toEqual([
      { key: "1", name: "Cabeza", count: 2 },
      { key: "2", name: "Espalda", count: 1 },
    ]);
  });

  it("falls back to the pain name when there is no id", () => {
    const options = getPainTypeOptions([record("1", "7", "Otro", undefined, at(2026, 10, 1))]);
    expect(options[0].key).toBe("Otro");
  });
});

describe("groupRecordsByDay", () => {
  it("groups consecutive records of the same calendar day", () => {
    const sorted = filterRecords(records, { personId: "7" });
    const groups = groupRecordsByDay(sorted);
    expect(groups.map((g) => g.key)).toEqual(["2026-10-22", "2026-10-20"]);
    expect(groups[0].records.map((r) => r.id)).toEqual(["3", "2"]);
  });

  it("returns an empty list for no records", () => {
    expect(groupRecordsByDay([])).toEqual([]);
    expect(groupRecordsByDay(undefined)).toEqual([]);
  });
});

describe("formatDayHeader", () => {
  const now = new Date(2026, 9, 22, 15);

  it("uses Hoy and Ayer for the two latest days", () => {
    expect(formatDayHeader(at(2026, 10, 22), now)).toBe("Hoy");
    expect(formatDayHeader(at(2026, 10, 21), now)).toBe("Ayer");
  });

  it("writes older days with weekday, day and month in Spanish", () => {
    expect(formatDayHeader(at(2026, 10, 20), now)).toBe("mar 20 oct 2026");
  });

  it("builds stable day keys from local dates", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("insertRecordSorted", () => {
  it("restores a record in its place by date, newest first", () => {
    const list = [records[2], records[0]]; // ids 3 and 1
    const result = insertRecordSorted(list, records[1]); // id 2 (older than 3)
    expect(result.map((r) => r.id)).toEqual(["3", "2", "1"]);
  });

  it("does not mutate the original list", () => {
    const list = [records[0]];
    insertRecordSorted(list, records[1]);
    expect(list).toHaveLength(1);
    expect(insertRecordSorted(undefined, records[0])).toHaveLength(1);
  });
});
