// Progress as the API keeps it (GET /progress, POST /records,
// POST /progress/achievements/:id) turned into the app's `user` state.
// Pure: no React, no network.
import { MANUAL_ACHIEVEMENT_IDS, computeLevel } from "./gamification";

// { points, level, records_count, unlocked_achievements: [{ id }] } -> app shape,
// or null when the payload is not usable (the caller then keeps what it has).
export const progressFromApi = (data) => {
  if (!data || typeof data.points !== "number") return null;
  const unlocked = Array.isArray(data.unlocked_achievements)
    ? data.unlocked_achievements
    : [];
  return {
    points: data.points,
    level: typeof data.level === "number" ? data.level : computeLevel(data.points),
    recordsCount: typeof data.records_count === "number" ? data.records_count : 0,
    unlockedIds: new Set(unlocked.map((entry) => entry.id)),
  };
};

// The server is the authority: points, level, records counted and which
// achievements are unlocked all come from it.
export const applyServerProgress = (user, progress) => ({
  ...user,
  points: progress.points,
  level: progress.level,
  recordsCount: progress.recordsCount,
  achievements: user.achievements.map((achievement) => ({
    ...achievement,
    unlocked: progress.unlockedIds.has(achievement.id),
  })),
});

// Achievements this device unlocked (sharing) that the server does not know
// yet, for example from before the server kept them. They are claimed once.
export const pendingManualAchievements = (localAchievements, progress) =>
  (localAchievements || [])
    .filter(
      (achievement) =>
        achievement.unlocked &&
        MANUAL_ACHIEVEMENT_IDS.includes(achievement.id) &&
        !progress.unlockedIds.has(achievement.id),
    )
    .map((achievement) => achievement.id);
