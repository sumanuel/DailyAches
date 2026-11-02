import {
  CUSTOM_DATE_KEY,
  DEFAULT_RECORD_DATE,
  RECORD_DATE_OPTIONS,
  createdAtForOption,
  formatCustomDate,
  fromDateTimeLocalValue,
  resolveRecordDate,
  toDateTimeLocalValue,
} from "../recordDate";

describe("createdAtForOption", () => {
  const now = new Date(2026, 5, 15, 14, 30);

  it("sends nothing for now, so the server uses its own clock", () => {
    expect(DEFAULT_RECORD_DATE).toBe("now");
    expect(createdAtForOption("now", now)).toBeUndefined();
  });

  it("goes back whole days keeping the time of day", () => {
    const yesterday = new Date(createdAtForOption("yesterday", now));
    expect(yesterday).toEqual(new Date(2026, 5, 14, 14, 30));
    const threeDays = new Date(createdAtForOption("threeDays", now));
    expect(threeDays).toEqual(new Date(2026, 5, 12, 14, 30));
  });

  it("is always in the past and returns an ISO string", () => {
    for (const { key } of RECORD_DATE_OPTIONS.filter((o) => o.daysAgo > 0)) {
      const value = createdAtForOption(key, now);
      expect(new Date(value).toISOString()).toBe(value);
      expect(Date.parse(value)).toBeLessThan(now.getTime());
    }
  });

  it("ignores unknown options", () => {
    expect(createdAtForOption("next-week", now)).toBeUndefined();
  });
});

describe("resolveRecordDate", () => {
  const now = new Date(2026, 5, 15, 14, 30);

  it("keeps the quick options working", () => {
    expect(resolveRecordDate({ option: "now" }, now)).toEqual({ createdAt: undefined });
    expect(resolveRecordDate({ option: "yesterday" }, now).createdAt).toBe(
      new Date(2026, 5, 14, 14, 30).toISOString(),
    );
    expect(resolveRecordDate(undefined, now)).toEqual({ createdAt: undefined });
  });

  it("sends the custom moment as an ISO string", () => {
    const customDate = new Date(2026, 2, 3, 9, 15);
    expect(resolveRecordDate({ option: CUSTOM_DATE_KEY, customDate }, now)).toEqual({
      createdAt: customDate.toISOString(),
    });
  });

  it("asks for a date when none was picked or it is not a date", () => {
    for (const customDate of [null, undefined, new Date("nope"), "2026-01-01"]) {
      expect(resolveRecordDate({ option: CUSTOM_DATE_KEY, customDate }, now).error).toBe(
        "Elige la fecha y la hora.",
      );
    }
  });

  it("refuses the future and the distant past", () => {
    const future = new Date(2026, 5, 15, 14, 31);
    expect(resolveRecordDate({ option: CUSTOM_DATE_KEY, customDate: future }, now).error).toBe(
      "Esa fecha todavía no llega.",
    );
    const old = new Date(1999, 11, 31);
    expect(resolveRecordDate({ option: CUSTOM_DATE_KEY, customDate: old }, now).error).toBe(
      "Esa fecha es demasiado antigua.",
    );
  });
});

describe("datetime-local values", () => {
  it("round-trips local time without seconds", () => {
    const date = new Date(2026, 0, 5, 7, 4);
    expect(toDateTimeLocalValue(date)).toBe("2026-01-05T07:04");
    expect(fromDateTimeLocalValue("2026-01-05T07:04")).toEqual(date);
  });

  it("rejects empty and malformed input", () => {
    expect(fromDateTimeLocalValue("")).toBeNull();
    expect(fromDateTimeLocalValue("2026-01-05")).toBeNull();
    expect(fromDateTimeLocalValue("2026-13-45T99:99")).toBeNull();
    expect(toDateTimeLocalValue(null)).toBe("");
  });
});

describe("formatCustomDate", () => {
  it("reads day, month, year and time", () => {
    expect(formatCustomDate(new Date(2026, 9, 12, 18, 5))).toBe("12 oct 2026, 18:05");
    expect(formatCustomDate(null)).toBe("");
  });
});
