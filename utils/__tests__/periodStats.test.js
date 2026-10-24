import {
  bucketByPeriod,
  buildWeeklyShareText,
  compareSummaries,
  computeSummary,
  countByPerson,
  describeAverageChange,
  describeCountChange,
  formatAverage,
  getPeriodRange,
  getWeeklyHighlights,
} from "../periodStats";

// Thursday 22 Oct 2026, mid-day
const NOW = new Date(2026, 9, 22, 12);
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).toISOString();
const rec = (id, personId, pain, createdAt, painLevel, painTypeId = pain) => ({
  id,
  personId,
  personName: personId === "7" ? "Ana" : "Luz",
  pain,
  painTypeId,
  painLevel,
  createdAt,
  notes: "",
});

describe("getPeriodRange", () => {
  it("week runs Monday to Sunday", () => {
    const range = getPeriodRange("week", 0, NOW);
    expect(range.start).toEqual(new Date(2026, 9, 19, 0, 0, 0, 0));
    expect(range.end.getDate()).toBe(25);
    expect(range.days).toBe(7);
    expect(range.elapsedDays).toBe(4);
    expect(range.label).toBe("19 – 25 oct 2026");
  });

  it("week label spans two months when needed", () => {
    expect(getPeriodRange("week", -3, NOW).label).toBe("28 sep – 04 oct 2026");
  });

  it("month and previous month", () => {
    const current = getPeriodRange("month", 0, NOW);
    expect(current.label).toBe("octubre 2026");
    expect(current.days).toBe(31);
    expect(current.elapsedDays).toBe(22);
    const previous = getPeriodRange("month", -1, NOW);
    expect(previous.label).toBe("septiembre 2026");
    expect(previous.days).toBe(30);
    expect(previous.elapsedDays).toBe(30);
  });

  it("year", () => {
    const range = getPeriodRange("year", 0, NOW);
    expect(range.label).toBe("2026");
    expect(range.days).toBe(365);
    expect(range.start.getMonth()).toBe(0);
    expect(range.end.getMonth()).toBe(11);
  });

  it("handles a Sunday as the end of the week", () => {
    const sunday = new Date(2026, 9, 25, 10);
    expect(getPeriodRange("week", 0, sunday).start.getDate()).toBe(19);
  });
});

describe("computeSummary", () => {
  const range = getPeriodRange("month", 0, NOW);
  const records = [
    rec("1", "7", "Cabeza", at(2026, 10, 3), 6),
    rec("2", "7", "Cabeza", at(2026, 10, 3, 18), 8),
    rec("3", "8", "Espalda", at(2026, 10, 10), 4),
    rec("4", "7", "Cabeza", at(2026, 9, 28), 9),
  ];

  it("counts only records inside the range", () => {
    const summary = computeSummary(records, range);
    expect(summary.count).toBe(3);
    expect(summary.activeDays).toBe(2);
    expect(summary.totalDays).toBe(22);
  });

  it("averages the intensity with one decimal and finds the top pain", () => {
    const summary = computeSummary(records, range);
    expect(summary.averageLevel).toBe(6);
    expect(summary.topPain).toEqual({ key: "Cabeza", name: "Cabeza", count: 2 });
  });

  it("returns empty values for a period without records", () => {
    const summary = computeSummary([], range);
    expect(summary.count).toBe(0);
    expect(summary.averageLevel).toBeNull();
    expect(summary.topPain).toBeNull();
  });

  it("ignores records without a usable intensity in the average", () => {
    const summary = computeSummary(
      [rec("1", "7", "Cabeza", at(2026, 10, 3), 8), rec("2", "7", "Cabeza", at(2026, 10, 4), undefined)],
      range,
    );
    expect(summary.count).toBe(2);
    expect(summary.averageLevel).toBe(8);
  });
});

describe("comparison wording", () => {
  const summary = (count, averageLevel) => ({ count, averageLevel });

  it("describes more, fewer, equal and no previous data", () => {
    expect(describeCountChange(compareSummaries(summary(5, 6), summary(2, 5)))).toBe(
      "3 más que el periodo anterior",
    );
    expect(describeCountChange(compareSummaries(summary(1, 6), summary(4, 5)))).toBe(
      "3 menos que el periodo anterior",
    );
    expect(describeCountChange(compareSummaries(summary(2, 6), summary(2, 5)))).toBe(
      "Igual que el periodo anterior",
    );
    expect(describeCountChange(compareSummaries(summary(2, 6), summary(0, null)))).toBe(
      "Sin registros en el periodo anterior",
    );
  });

  it("describes the intensity change with a decimal comma", () => {
    expect(describeAverageChange(compareSummaries(summary(2, 6.5), summary(2, 5.7)))).toBe(
      "0,8 más alta que el periodo anterior",
    );
    expect(describeAverageChange(compareSummaries(summary(2, 5), summary(2, 6)))).toBe(
      "1 más baja que el periodo anterior",
    );
    expect(describeAverageChange(compareSummaries(summary(2, null), summary(2, 6)))).toBe("");
  });

  it("formats averages", () => {
    expect(formatAverage(6.5)).toBe("6,5");
    expect(formatAverage(null)).toBe("–");
  });
});

describe("bucketByPeriod", () => {
  const records = [
    rec("1", "7", "Cabeza", at(2026, 10, 19), 5),
    rec("2", "7", "Cabeza", at(2026, 10, 19, 20), 5),
    rec("3", "7", "Cabeza", at(2026, 10, 22), 5),
    rec("4", "7", "Cabeza", at(2026, 3, 5), 5),
  ];

  it("week: seven days starting on Monday", () => {
    const buckets = bucketByPeriod(records, "week", getPeriodRange("week", 0, NOW));
    expect(buckets.map((b) => b.label)).toEqual(["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]);
    expect(buckets.map((b) => b.count)).toEqual([2, 0, 0, 1, 0, 0, 0]);
  });

  it("month: one bucket per day", () => {
    const buckets = bucketByPeriod(records, "month", getPeriodRange("month", 0, NOW));
    expect(buckets).toHaveLength(31);
    expect(buckets[18]).toMatchObject({ label: "19", count: 2 });
  });

  it("year: one bucket per month", () => {
    const buckets = bucketByPeriod(records, "year", getPeriodRange("year", 0, NOW));
    expect(buckets).toHaveLength(12);
    expect(buckets[2].count).toBe(1);
    expect(buckets[9].count).toBe(3);
  });
});

describe("countByPerson", () => {
  it("orders people by number of records and uses current names", () => {
    const records = [
      rec("1", "7", "Cabeza", at(2026, 10, 3), 5),
      rec("2", "8", "Cabeza", at(2026, 10, 3), 5),
      rec("3", "8", "Cabeza", at(2026, 10, 4), 5),
    ];
    expect(countByPerson(records, [{ id: "8", name: "Luz M." }])).toEqual([
      { key: "8", name: "Luz M.", count: 2 },
      { key: "7", name: "Ana", count: 1 },
    ]);
  });
});

describe("getWeeklyHighlights and the share text", () => {
  // Thursday 22 Oct 2026: this week started Monday 19, last week Monday 12
  const records = [
    rec("1", "7", "Cabeza", at(2026, 10, 19), 6),
    rec("2", "7", "Cabeza", at(2026, 10, 20), 8),
    rec("3", "8", "Espalda", at(2026, 10, 21), 4),
    rec("4", "7", "Cabeza", at(2026, 10, 13), 5),
  ];

  it("compares this week with the previous one", () => {
    const week = getWeeklyHighlights(records, NOW);
    expect(week.range.label).toBe("19 – 25 oct 2026");
    expect(week.summary.count).toBe(3);
    expect(week.summary.activeDays).toBe(3);
    expect(week.previous.count).toBe(1);
    expect(week.comparison.countDelta).toBe(2);
  });

  it("writes a share message with counts but no names or notes", () => {
    const text = buildWeeklyShareText(getWeeklyHighlights(records, NOW));
    expect(text).toBe(
      "Mi semana en DailyAches (19 – 25 oct 2026): 3 registros, sobre todo Cabeza, intensidad media 6. 2 más que el periodo anterior. #DailyAches",
    );
    expect(text).not.toMatch(/Ana|Luz/);
  });

  it("has its own wording for a week without records", () => {
    const text = buildWeeklyShareText(getWeeklyHighlights([], NOW));
    expect(text).toBe("Semana del 19 – 25 oct 2026: sin achaques registrados en DailyAches. #DailyAches");
  });

  it("uses the singular for one record", () => {
    const text = buildWeeklyShareText(
      getWeeklyHighlights([rec("1", "7", "Cabeza", at(2026, 10, 20), 7)], NOW),
    );
    expect(text).toContain(": 1 registro,");
  });
});
