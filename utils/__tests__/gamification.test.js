import {
  achievementDefinitions,
  applyAutomaticAchievements,
  buildProgressState,
  computeLevel,
  getDefaultAchievements,
  getNextLevelRequirement,
  isSameDay,
  levels,
  mergeAchievements,
} from "../gamification";

const emptyUser = () => ({
  points: 0,
  recordsCount: 0,
  achievements: getDefaultAchievements(),
});

const unlockedIds = (achievements) =>
  achievements.filter((a) => a.unlocked).map((a) => a.id);

describe("computeLevel", () => {
  it("starts at level 1", () => {
    expect(computeLevel(0)).toBe(1);
  });

  it("changes level exactly at the points threshold", () => {
    expect(computeLevel(39)).toBe(1);
    expect(computeLevel(40)).toBe(2);
    expect(computeLevel(94)).toBe(2);
    expect(computeLevel(95)).toBe(3);
  });

  it("caps at the last level", () => {
    expect(computeLevel(1_000_000)).toBe(levels[levels.length - 1].level);
  });
});

describe("getNextLevelRequirement", () => {
  it("returns the following level", () => {
    expect(getNextLevelRequirement(1).level).toBe(2);
  });

  it("returns null at max level and for unknown levels", () => {
    expect(getNextLevelRequirement(levels[levels.length - 1].level)).toBeNull();
    expect(getNextLevelRequirement(99)).toBeNull();
  });
});

describe("applyAutomaticAchievements", () => {
  it("unlocks record-count achievements and awards their points", () => {
    const result = applyAutomaticAchievements({
      ...emptyUser(),
      recordsCount: 1,
    });
    expect(unlockedIds(result.achievements)).toEqual([1]);
    expect(result.points).toBe(15);
  });

  it("chains level achievements when points cross a level", () => {
    // 1 record -> +15; reaching 40 points is level 2, which unlocks achievement 7 (+20)
    const result = applyAutomaticAchievements({
      ...emptyUser(),
      recordsCount: 1,
      points: 30,
    });
    expect(unlockedIds(result.achievements)).toEqual([1, 7]);
    expect(result.points).toBe(30 + 15 + 20);
    expect(result.level).toBe(computeLevel(result.points));
  });

  it("does not award an achievement twice", () => {
    const first = applyAutomaticAchievements({
      ...emptyUser(),
      recordsCount: 1,
    });
    const second = applyAutomaticAchievements({
      achievements: first.achievements,
      recordsCount: 1,
      points: first.points,
    });
    expect(second.points).toBe(first.points);
  });

  it("does not mutate the achievements it receives", () => {
    const achievements = getDefaultAchievements();
    applyAutomaticAchievements({ achievements, recordsCount: 5, points: 0 });
    expect(unlockedIds(achievements)).toEqual([]);
  });
});

describe("buildProgressState", () => {
  it("adds records and base points, then applies unlocks", () => {
    const next = buildProgressState(emptyUser(), {
      recordsAdded: 1,
      basePoints: 10,
    });
    expect(next.recordsCount).toBe(1);
    expect(next.points).toBe(25);
    expect(next.level).toBe(1);
  });

  it("keeps points and level consistent after many records", () => {
    let user = emptyUser();
    for (let i = 0; i < 40; i++) {
      user = buildProgressState(user, { recordsAdded: 1, basePoints: 10 });
    }
    expect(user.recordsCount).toBe(40);
    expect(user.level).toBe(computeLevel(user.points));
    expect(unlockedIds(user.achievements)).toEqual(
      expect.arrayContaining([1, 2, 3, 4, 5, 6]),
    );
  });
});

describe("mergeAchievements", () => {
  it("restores unlocked flags by id and ignores unknown ones", () => {
    const merged = mergeAchievements([
      { id: 2, unlocked: true },
      { id: 9999, unlocked: true },
    ]);
    expect(merged).toHaveLength(achievementDefinitions.length);
    expect(unlockedIds(merged)).toEqual([2]);
  });

  it("falls back to defaults without saved data", () => {
    expect(unlockedIds(mergeAchievements(undefined))).toEqual([]);
    expect(unlockedIds(mergeAchievements(null))).toEqual([]);
  });
});

describe("isSameDay", () => {
  it("compares calendar days, not timestamps", () => {
    expect(
      isSameDay(new Date(2026, 5, 1, 0, 5), new Date(2026, 5, 1, 23, 55)),
    ).toBe(true);
    expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBe(false);
  });
});
