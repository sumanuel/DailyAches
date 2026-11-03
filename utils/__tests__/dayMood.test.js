import {
  AMBIENT_EVERY_MS,
  getAmbientBurst,
  getDayMood,
  dayScore,
  nextAmbientDelay,
} from "../dayMood";

describe("getDayMood with one person", () => {
  it.each([
    [0, "party"],
    [1, "leaves"],
    [2, "leaves"],
    [3, "leaves"],
    [4, "sad"],
    [5, "sad"],
    [6, "storm"],
    [12, "storm"],
  ])("%i pains today is %s", (pains, mood) => {
    expect(getDayMood(pains, 1)).toBe(mood);
  });

  it("treats no people like one", () => {
    expect(getDayMood(4, 0)).toBe("sad");
  });
});

describe("getDayMood with more people", () => {
  it("multiplies the pains by the number of people", () => {
    expect(dayScore(2, 2)).toBe(4);
    expect(getDayMood(2, 2)).toBe("sad"); // 2 pains x 2 people = 4
    expect(getDayMood(1, 2)).toBe("leaves"); // 2
    expect(getDayMood(3, 2)).toBe("storm"); // 6
    expect(getDayMood(2, 3)).toBe("storm"); // 6
    expect(getDayMood(1, 4)).toBe("sad"); // 4
  });

  it("still celebrates a day without pains, however many people", () => {
    expect(getDayMood(0, 5)).toBe("party");
  });
});

describe("getAmbientBurst", () => {
  it("says what to fire for each mood", () => {
    expect(getAmbientBurst(0, 1)).toMatchObject({ mood: "party", preset: "rain" });
    const leaves = getAmbientBurst(2, 1);
    expect(leaves).toMatchObject({ mood: "leaves", preset: "emojiRain" });
    expect(leaves.options.emojis).toContain("🍃");
    expect(getAmbientBurst(4, 1).options.emojis).toContain("😢");
    expect(getAmbientBurst(9, 1).options.emojis).toContain("🌧️");
  });
});

describe("nextAmbientDelay", () => {
  it("stays within a fifth of two minutes", () => {
    expect(nextAmbientDelay(() => 0)).toBe(AMBIENT_EVERY_MS * 0.8);
    expect(nextAmbientDelay(() => 1)).toBe(AMBIENT_EVERY_MS * 1.2);
    expect(nextAmbientDelay(() => 0.5)).toBe(AMBIENT_EVERY_MS);
  });
});
