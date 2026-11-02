import {
  DEFAULT_RECORD_DATE,
  RECORD_DATE_OPTIONS,
  createdAtForOption,
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
