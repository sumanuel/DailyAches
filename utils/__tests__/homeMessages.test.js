import {
  daySeed,
  getCalmDayShareText,
  getGreeting,
  getHomeMessages,
} from "../homeMessages";

const day = (d, hour = 12) => new Date(2026, 9, d, hour, 30);
const rec = (painLevel) => ({ painLevel });
const ALARMING = /grave|urgente|peligro|morir|muerte|alarma/i;

// Every day of a month: all the versions of a situation get exercised.
const monthOf = (build) => Array.from({ length: 30 }, (_, i) => build(day(i + 1)));
const unique = (values) => [...new Set(values)];

describe("getGreeting", () => {
  it("changes with the time of day", () => {
    expect(getGreeting(day(24, 7))).toBe("Buenos días");
    expect(getGreeting(day(24, 11))).toBe("Buenos días");
    expect(getGreeting(day(24, 12))).toBe("Buenas tardes");
    expect(getGreeting(day(24, 19))).toBe("Buenas tardes");
    expect(getGreeting(day(24, 20))).toBe("Buenas noches");
    expect(getGreeting(day(24, 2))).toBe("Buenas noches");
  });

  it("adds the first name only", () => {
    expect(getGreeting(day(24, 9), "  Ana María Pérez ")).toBe("Buenos días, Ana");
    expect(getGreeting(day(24, 9), "")).toBe("Buenos días");
    expect(getGreeting(day(24, 9), undefined)).toBe("Buenos días");
  });
});

describe("rotation", () => {
  it("gives the same texts all day and other texts on other days", () => {
    const morning = getHomeMessages({ now: day(24, 8) });
    const sameDayLater = getHomeMessages({ now: day(24, 10) });
    expect(sameDayLater.title).toBe(morning.title);

    const titles = monthOf((now) => getHomeMessages({ todayRecords: [], now }).title);
    expect(unique(titles).length).toBeGreaterThan(3);
  });

  it("is stable for the same date and moves forward with it", () => {
    expect(daySeed(day(24))).toBe(daySeed(day(24, 22)));
    expect(daySeed(day(25))).toBe(daySeed(day(24)) + 1);
  });
});

describe("nothing recorded", () => {
  it("has texts for every part of the day", () => {
    for (const hour of [3, 9, 15, 21]) {
      const result = getHomeMessages({ todayRecords: [], now: day(24, hour) });
      expect(result.title.length).toBeGreaterThan(3);
      expect(result.description.length).toBeGreaterThan(20);
      expect(result.emptyTitle.length).toBeGreaterThan(3);
      expect(result.note.length).toBeGreaterThan(10);
    }
  });

  it("only offers to celebrate from the evening on", () => {
    expect(getHomeMessages({ todayRecords: [], now: day(24, 10) }).celebrate).toBe(false);
    expect(getHomeMessages({ todayRecords: [], now: day(24, 3) }).celebrate).toBe(false);
    expect(getHomeMessages({ todayRecords: [], now: day(24, 19) }).celebrate).toBe(true);
  });

  it("never claims there was no pain in the evening: it says nothing was written down", () => {
    const descriptions = monthOf((now) => getHomeMessages({ todayRecords: [], now: new Date(now.setHours(21)) }).description);
    expect(descriptions.every((d) => !/no hubo dolor|sin dolor alguno/i.test(d))).toBe(true);
  });
});

describe("with records", () => {
  it("describes one, two and many episodes", () => {
    const one = getHomeMessages({ todayRecords: [rec(4)], now: day(24) });
    const two = getHomeMessages({ todayRecords: [rec(4), rec(5)], now: day(24) });
    const many = getHomeMessages({ todayRecords: [rec(2), rec(3), rec(4), rec(5)], now: day(24) });
    expect(one.celebrate || two.celebrate || many.celebrate).toBe(false);
    expect(many.description).toContain("4");
    expect(unique(monthOf((now) => getHomeMessages({ todayRecords: [rec(2), rec(3), rec(4)], now }).title)).length).toBeGreaterThan(1);
    expect(one.emptyTitle).toBe("");
  });

  it("keeps care first after a strong pain, always pointing to a professional", () => {
    const results = monthOf((now) => getHomeMessages({ todayRecords: [rec(3), rec(9)], now }));
    for (const result of results) {
      expect(result.description).toMatch(/consulta|consultarlo/i);
      expect(`${result.title} ${result.description} ${result.forecastChip}`).not.toMatch(ALARMING);
    }
  });

  it("never celebrates, whatever the hour", () => {
    for (const hour of [9, 22]) {
      expect(getHomeMessages({ todayRecords: [rec(5)], now: day(24, hour) }).celebrate).toBe(false);
    }
  });

  it("ignores missing intensities and uses the name in the greeting", () => {
    const result = getHomeMessages({ todayRecords: [{}], now: day(24, 15), name: "Luz Mar" });
    expect(result.greeting).toBe("Buenas tardes, Luz");
    expect(result.description.length).toBeGreaterThan(10);
  });
});

describe("shared pieces", () => {
  it("always has a call to action and a log header", () => {
    for (const result of monthOf((now) => getHomeMessages({ todayRecords: [rec(5)], now }))) {
      expect(result.cta.length).toBeGreaterThan(3);
      expect(result.logTitle.length).toBeGreaterThan(3);
      expect(result.logSubtitle.length).toBeGreaterThan(10);
    }
  });

  it("has no texts without their accents in the words that need them", () => {
    const all = monthOf((now) => JSON.stringify(getHomeMessages({ todayRecords: [], now: new Date(now.setHours(21)) }))).join(" ");
    expect(all).not.toMatch(/\bDia\b|\bPronostico\b|\bTodavia\b|\bmas\b claro/);
  });

  it("works with no arguments", () => {
    expect(getHomeMessages().greeting).toMatch(/^Buen/);
  });
});

describe("calm day share text", () => {
  it("has several versions and no personal or numeric data", () => {
    const texts = monthOf((now) => getCalmDayShareText(now));
    expect(unique(texts).length).toBeGreaterThan(1);
    for (const text of texts) {
      expect(text).toContain("#DailyAches");
      expect(text).not.toMatch(/\d/);
    }
  });
});
