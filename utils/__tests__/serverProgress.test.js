import { getDefaultAchievements, SHARE_ACHIEVEMENT_ID } from "../gamification";
import {
  applyServerProgress,
  pendingManualAchievements,
  progressFromApi,
} from "../serverProgress";

const apiProgress = (overrides = {}) => ({
  points: 85,
  level: 2,
  records_count: 3,
  unlocked_achievements: [
    { id: 1, unlocked_at: "2026-11-02T10:00:00.000Z" },
    { id: 2, unlocked_at: "2026-11-02T10:00:00.000Z" },
    { id: 7, unlocked_at: "2026-11-02T10:00:00.000Z" },
  ],
  ...overrides,
});

const freshUser = () => ({
  points: 0,
  level: 1,
  recordsCount: 0,
  achievements: getDefaultAchievements(),
  records: [],
});

describe("progressFromApi", () => {
  it("turns the API payload into the app's shape", () => {
    const progress = progressFromApi(apiProgress());
    expect(progress.points).toBe(85);
    expect(progress.level).toBe(2);
    expect(progress.recordsCount).toBe(3);
    expect([...progress.unlockedIds].sort()).toEqual([1, 2, 7]);
  });

  it("rejects what is not a progress payload", () => {
    expect(progressFromApi(undefined)).toBeNull();
    expect(progressFromApi({})).toBeNull();
    expect(progressFromApi({ points: "85" })).toBeNull();
  });

  it("falls back to the level the points imply when the level is missing", () => {
    expect(progressFromApi(apiProgress({ level: undefined })).level).toBe(2);
  });

  it("tolerates a missing list of achievements", () => {
    const progress = progressFromApi({ points: 0, level: 1, records_count: 0 });
    expect(progress.unlockedIds.size).toBe(0);
  });
});

describe("applyServerProgress", () => {
  it("replaces points, level, count and unlocked flags with the server's", () => {
    const next = applyServerProgress(freshUser(), progressFromApi(apiProgress()));
    expect(next.points).toBe(85);
    expect(next.level).toBe(2);
    expect(next.recordsCount).toBe(3);
    expect(next.achievements.filter((a) => a.unlocked).map((a) => a.id)).toEqual([1, 2, 7]);
  });

  it("locks what the server does not report, and keeps the rest of the user", () => {
    const user = freshUser();
    user.achievements = user.achievements.map((a) => ({ ...a, unlocked: true }));
    user.records = [{ id: "1" }];
    user.profile = { name: "Ana" };

    const next = applyServerProgress(user, progressFromApi(apiProgress()));

    expect(next.achievements.filter((a) => a.unlocked)).toHaveLength(3);
    expect(next.records).toEqual([{ id: "1" }]);
    expect(next.profile).toEqual({ name: "Ana" });
  });

  it("does not mutate the user it receives", () => {
    const user = freshUser();
    applyServerProgress(user, progressFromApi(apiProgress()));
    expect(user.points).toBe(0);
    expect(user.achievements.every((a) => !a.unlocked)).toBe(true);
  });
});

describe("pendingManualAchievements", () => {
  const withShared = (unlocked) =>
    getDefaultAchievements().map((a) =>
      a.id === SHARE_ACHIEVEMENT_ID ? { ...a, unlocked } : a,
    );

  it("lists sharing when this device unlocked it and the server did not", () => {
    const progress = progressFromApi(apiProgress());
    expect(pendingManualAchievements(withShared(true), progress)).toEqual([
      SHARE_ACHIEVEMENT_ID,
    ]);
  });

  it("is empty when the server already has it or the device never did", () => {
    const known = progressFromApi(
      apiProgress({ unlocked_achievements: [{ id: SHARE_ACHIEVEMENT_ID }] }),
    );
    expect(pendingManualAchievements(withShared(true), known)).toEqual([]);
    expect(
      pendingManualAchievements(withShared(false), progressFromApi(apiProgress())),
    ).toEqual([]);
  });

  it("never claims automatic achievements, even if the device had them", () => {
    const local = getDefaultAchievements().map((a) => ({ ...a, unlocked: true }));
    const pending = pendingManualAchievements(
      local,
      progressFromApi(apiProgress({ unlocked_achievements: [] })),
    );
    expect(pending).toEqual([SHARE_ACHIEVEMENT_ID]);
  });

  it("copes with no local achievements", () => {
    expect(pendingManualAchievements(undefined, progressFromApi(apiProgress()))).toEqual([]);
  });
});
