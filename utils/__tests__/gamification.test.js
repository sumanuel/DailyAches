import {
  POINTS_PER_RECORD,
  SHARE_ACHIEVEMENT_ID,
  achievementDefinitions,
  applyAutomaticAchievements,
  buildProgressState,
  computeLevel,
  describeAchievementProgress,
  getAchievementProgress,
  getDefaultAchievements,
  getNextAchievement,
  getNextLevelRequirement,
  getUserStorageKey,
  isSameDay,
  levels,
  mergeAchievements,
  reconcileProgress,
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

describe("getAchievementProgress", () => {
  const byId = (id) => achievementDefinitions.find((a) => a.id === id);

  it("counts records towards record achievements", () => {
    const progress = getAchievementProgress(byId(4), { recordsCount: 7, points: 0 });
    expect(progress).toMatchObject({ kind: "records", current: 7, target: 10 });
    expect(progress.ratio).toBeCloseTo(0.7);
    expect(describeAchievementProgress(progress)).toBe("7 de 10 registros");
  });

  it("uses points towards level achievements", () => {
    const progress = getAchievementProgress(byId(8), { recordsCount: 0, points: 85 });
    expect(progress).toMatchObject({ kind: "points", current: 85, target: 170 });
    expect(describeAchievementProgress(progress)).toBe("85 de 170 pts");
  });

  it("never goes past the target and reports unlocked ones as complete", () => {
    expect(getAchievementProgress(byId(1), { recordsCount: 50 }).ratio).toBe(1);
    const done = getAchievementProgress({ ...byId(6), unlocked: true }, { recordsCount: 0 });
    expect(done.ratio).toBe(1);
  });

  it("treats the share achievement as manual", () => {
    const progress = getAchievementProgress(byId(SHARE_ACHIEVEMENT_ID), {});
    expect(progress.kind).toBe("manual");
    expect(progress.ratio).toBe(0);
    expect(byId(SHARE_ACHIEVEMENT_ID).name).toBe("Compartidor");
  });
});

describe("getNextAchievement", () => {
  it("picks the locked achievement closest to completion", () => {
    // 4 records already unlocked the 1 and 3 record achievements
    const achievements = getDefaultAchievements().map((a) => ({
      ...a,
      unlocked: a.id === 1 || a.id === 2,
    }));
    const next = getNextAchievement(achievements, { recordsCount: 4, points: 0 });
    expect(next.achievement.id).toBe(3); // 4 of 5 records
  });

  it("skips unlocked and manual achievements", () => {
    const achievements = getDefaultAchievements().map((a) => ({
      ...a,
      unlocked: a.id !== SHARE_ACHIEVEMENT_ID,
    }));
    expect(getNextAchievement(achievements, {})).toBeNull();
  });

  it("breaks ties with the nearest target", () => {
    const next = getNextAchievement(getDefaultAchievements(), { recordsCount: 0, points: 0 });
    expect(next.achievement.id).toBe(1);
  });
});

describe("reconcileProgress", () => {
  it("adds the records the server has that were never counted", () => {
    const user = { points: 0, recordsCount: 0, level: 1, achievements: getDefaultAchievements() };
    const next = reconcileProgress(user, 3);
    expect(next.recordsCount).toBe(3);
    expect(next.points).toBeGreaterThanOrEqual(3 * POINTS_PER_RECORD);
    expect(unlockedIds(next.achievements)).toEqual(expect.arrayContaining([1, 2]));
  });

  it("leaves the user alone when nothing is missing, including after deletes", () => {
    const user = { points: 50, recordsCount: 5, level: 2, achievements: getDefaultAchievements() };
    expect(reconcileProgress(user, 5)).toBe(user);
    expect(reconcileProgress(user, 2)).toBe(user);
  });
});

describe("getUserStorageKey", () => {
  it("separates saved progress per user", () => {
    expect(getUserStorageKey("7")).toBe("userData:7");
    expect(getUserStorageKey(null)).toBe("userData");
    expect(getUserStorageKey("")).toBe("userData");
  });
});
