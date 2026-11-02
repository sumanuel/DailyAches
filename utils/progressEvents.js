// What changed between two progress snapshots, and how to say it. Pure: the
// context stamps the result on the user and a component celebrates it.
import { getLevelMeta } from "./gamification";

let lastEventId = 0;

// Returns null when nothing worth celebrating happened.
export const describeProgress = (prev, next) => {
  const pointsGained = next.points - prev.points;
  const alreadyUnlocked = new Set(
    prev.achievements.filter((a) => a.unlocked).map((a) => a.id),
  );
  const newAchievements = next.achievements
    .filter((a) => a.unlocked && !alreadyUnlocked.has(a.id))
    .map(({ id, name, points }) => ({ id, name, points }));
  const leveledUp = next.level > prev.level;
  const recordSaved = next.recordsCount > prev.recordsCount;

  if (pointsGained <= 0 && newAchievements.length === 0 && !leveledUp) {
    return null;
  }

  return {
    pointsGained,
    newAchievements,
    leveledUp,
    recordSaved,
    level: next.level,
    levelTitle: getLevelMeta(next.level).title,
  };
};

// Next snapshot with a `progressEvent` attached when there is something to show.
export const withProgressEvent = (prev, next) => {
  const event = describeProgress(prev, next);
  if (!event) return next;
  lastEventId += 1;
  return { ...next, progressEvent: { ...event, id: lastEventId } };
};

// Icon, headline and detail for an event. A level-up outranks an achievement,
// which outranks plain points.
export const celebrationMessage = (event) => {
  const names = event.newAchievements.map((a) => a.name);
  const points = `+${event.pointsGained} puntos`;

  if (event.leveledUp) {
    return {
      kind: "level",
      icon: "🎉",
      title: `¡Subiste al nivel ${event.level}!`,
      detail: [event.levelTitle, ...names].join(" · "),
    };
  }
  if (names.length === 1) {
    return {
      kind: "achievement",
      icon: "🏆",
      title: `¡Logro: ${names[0]}!`,
      detail: points,
    };
  }
  if (names.length > 1) {
    return {
      kind: "achievement",
      icon: "🏆",
      title: `¡${names.length} logros desbloqueados!`,
      detail: `${names.join(" · ")} · ${points}`,
    };
  }
  return {
    kind: "points",
    icon: "✅",
    title: points,
    detail: event.recordSaved ? "Registro guardado" : undefined,
  };
};
