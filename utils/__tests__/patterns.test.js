import {
  MIN_RECORDS_FOR_PATTERNS,
  dayPartDistribution,
  describeMissingData,
  findPatterns,
  weekdayDistribution,
} from "../patterns";

// 2026-10-19 is a Monday
const at = (day, hour = 12) => new Date(2026, 9, day, hour).toISOString();
const rec = (id, createdAt, pain = "Cabeza") => ({
  id,
  createdAt,
  pain,
  painTypeId: pain,
});

describe("distributions", () => {
  it("counts weekdays starting on Monday", () => {
    const counts = weekdayDistribution([
      rec(1, at(19)), // Monday
      rec(2, at(19, 20)), // Monday
      rec(3, at(25)), // Sunday
    ]);
    expect(counts).toEqual([2, 0, 0, 0, 0, 0, 1]);
  });

  it("counts the part of the day by hour", () => {
    const counts = dayPartDistribution([
      rec(1, at(19, 3)),
      rec(2, at(19, 6)),
      rec(3, at(19, 11)),
      rec(4, at(19, 12)),
      rec(5, at(19, 18)),
      rec(6, at(19, 19)),
      rec(7, at(19, 23)),
    ]);
    expect(counts).toEqual([1, 2, 2, 2]);
  });

  it("ignores invalid dates and missing lists", () => {
    expect(weekdayDistribution([rec(1, "nope")])).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(weekdayDistribution(undefined)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(dayPartDistribution(undefined)).toEqual([0, 0, 0, 0]);
  });
});

describe("findPatterns", () => {
  it("needs a minimum number of records", () => {
    const few = Array.from({ length: MIN_RECORDS_FOR_PATTERNS - 1 }, (_, i) => rec(i, at(19)));
    expect(findPatterns(few)).toEqual([]);
  });

  it("reports a weekday that holds most of the records", () => {
    const records = [
      rec(1, at(19, 9), "Cabeza"),
      rec(2, at(26 - 7, 21), "Espalda"),
      rec(3, at(19, 15), "Cuello"),
      rec(4, at(20, 9), "Ojos"),
      rec(5, at(21, 9), "Pies"),
      rec(6, at(22, 9), "Manos"),
    ];
    const patterns = findPatterns(records);
    expect(patterns.map((p) => p.kind)).toContain("weekday");
    expect(patterns.find((p) => p.kind === "weekday").text).toBe(
      "Suele aparecer los lunes: 3 de 6 registros (50 %).",
    );
  });

  it("reports the part of the day and the repeated pain when they stand out", () => {
    const records = [
      rec(1, at(19, 22)),
      rec(2, at(20, 21)),
      rec(3, at(21, 23)),
      rec(4, at(22, 20)),
      rec(5, at(23, 8), "Espalda"),
      rec(6, at(24, 14), "Cuello"),
    ];
    const patterns = findPatterns(records);
    expect(patterns.find((p) => p.kind === "daypart").text).toBe(
      "Se anota sobre todo por la noche: 4 de 6 registros (67 %).",
    );
    expect(patterns.find((p) => p.kind === "pain").text).toBe(
      "Cabeza es el dolor más repetido: 4 de 6 registros (67 %).",
    );
  });

  it("finds nothing when records are spread evenly", () => {
    const records = [
      rec(1, at(19, 2), "A"),
      rec(2, at(20, 8), "B"),
      rec(3, at(21, 14), "C"),
      rec(4, at(22, 20), "D"),
      rec(5, at(23, 3), "E"),
      rec(6, at(24, 9), "F"),
      rec(7, at(25, 15), "G"),
      rec(8, at(26, 21), "H"),
    ];
    expect(findPatterns(records)).toEqual([]);
  });

  it("does not call a tie a pattern", () => {
    const records = [
      rec(1, at(19, 9), "A"),
      rec(2, at(19, 15), "B"),
      rec(3, at(19, 21), "C"),
      rec(4, at(20, 9), "D"),
      rec(5, at(20, 15), "E"),
      rec(6, at(20, 21), "F"),
    ];
    expect(findPatterns(records).filter((p) => p.kind === "weekday")).toEqual([]);
  });
});

describe("describeMissingData", () => {
  it("tells apart too little data from no clear pattern", () => {
    expect(describeMissingData(2)).toBe(
      "Aún hay pocos registros para ver patrones (2 de 6 necesarios).",
    );
    expect(describeMissingData(9)).toBe("No se ve ningún patrón claro en este periodo.");
  });
});
