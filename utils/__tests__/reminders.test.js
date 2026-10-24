import {
  DEFAULT_REMINDER,
  dateToReminder,
  describeReminder,
  formatReminderTime,
  normalizeReminder,
  reminderToDate,
} from "../reminders";

describe("normalizeReminder", () => {
  it("keeps valid values", () => {
    expect(normalizeReminder({ enabled: true, hour: 7, minute: 30 })).toEqual({
      enabled: true,
      hour: 7,
      minute: 30,
    });
  });

  it("falls back to the defaults for missing or corrupt data", () => {
    expect(normalizeReminder(undefined)).toEqual(DEFAULT_REMINDER);
    expect(normalizeReminder({ enabled: "yes", hour: "x", minute: null })).toEqual(
      DEFAULT_REMINDER,
    );
  });

  it("clamps impossible times", () => {
    expect(normalizeReminder({ hour: 31, minute: -5 })).toMatchObject({
      hour: 23,
      minute: 0,
    });
    expect(normalizeReminder({ hour: 8.6, minute: 75 })).toMatchObject({
      hour: 9,
      minute: 59,
    });
  });
});

describe("describing the reminder", () => {
  it("formats the time with two digits", () => {
    expect(formatReminderTime({ hour: 7, minute: 5 })).toBe("07:05");
    expect(formatReminderTime({ hour: 20, minute: 0 })).toBe("20:00");
  });

  it("says when it fires, or that it is off", () => {
    expect(describeReminder({ enabled: true, hour: 20, minute: 30 })).toBe(
      "Todos los días a las 20:30",
    );
    expect(describeReminder({ enabled: false, hour: 20, minute: 30 })).toBe(
      "Desactivado",
    );
  });
});

describe("date conversion for the picker", () => {
  it("round-trips hour and minute", () => {
    const date = reminderToDate({ hour: 6, minute: 45 }, new Date(2026, 9, 24, 15, 10));
    expect(date.getHours()).toBe(6);
    expect(date.getMinutes()).toBe(45);
    expect(date.getDate()).toBe(24);
    expect(dateToReminder(date, { enabled: true, hour: 1, minute: 1 })).toEqual({
      enabled: true,
      hour: 6,
      minute: 45,
    });
  });
});
