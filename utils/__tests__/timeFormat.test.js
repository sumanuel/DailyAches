import { formatClock, formatClockParts } from "../timeFormat";

describe("formatClockParts", () => {
  it("uses two digits, a 12 hour clock and lowercase am/pm", () => {
    expect(formatClockParts(8, 5)).toBe("08:05 am");
    expect(formatClockParts(15, 30)).toBe("03:30 pm");
    expect(formatClockParts(23, 59)).toBe("11:59 pm");
  });

  it("writes midnight and noon as 12", () => {
    expect(formatClockParts(0, 0)).toBe("12:00 am");
    expect(formatClockParts(0, 45)).toBe("12:45 am");
    expect(formatClockParts(12, 0)).toBe("12:00 pm");
    expect(formatClockParts(12, 59)).toBe("12:59 pm");
  });
});

describe("formatClock", () => {
  it("formats dates, timestamps and ISO strings in local time", () => {
    const date = new Date(2026, 10, 3, 18, 7);
    expect(formatClock(date)).toBe("06:07 pm");
    expect(formatClock(date.getTime())).toBe("06:07 pm");
    expect(formatClock(date.toISOString())).toBe("06:07 pm");
  });

  it("gives an empty text when there is no valid time", () => {
    expect(formatClock(undefined)).toBe("");
    expect(formatClock("nope")).toBe("");
  });
});
