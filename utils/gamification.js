export const achievementDefinitions = [
  {
    id: 1,
    name: "Primer Registro",
    description: "Registra el primer dolor del tablero",
    points: 15,
    icon: "flag-checkered",
    unlocked: false,
  },
  {
    id: 2,
    name: "Tres al Radar",
    description: "Acumula 3 registros",
    points: 20,
    icon: "radar",
    unlocked: false,
  },
  {
    id: 3,
    name: "Cinco Episodios",
    description: "Acumula 5 registros",
    points: 30,
    icon: "clipboard-pulse-outline",
    unlocked: false,
  },
  {
    id: 4,
    name: "Diez Dolores",
    description: "Acumula 10 registros",
    points: 45,
    icon: "notebook-multiple",
    unlocked: false,
  },
  {
    id: 5,
    name: "Veinte al Archivo",
    description: "Acumula 20 registros",
    points: 70,
    icon: "archive-outline",
    unlocked: false,
  },
  {
    id: 6,
    name: "Cuarenta en Bitácora",
    description: "Acumula 40 registros",
    points: 110,
    icon: "book-open-page-variant-outline",
    unlocked: false,
  },
  {
    id: 7,
    name: "Nivel 2",
    description: "Llega al nivel Observadora",
    points: 20,
    icon: "star-circle-outline",
    unlocked: false,
  },
  {
    id: 8,
    name: "Nivel 4",
    description: "Llega al nivel Cuidadora",
    points: 45,
    icon: "medal-outline",
    unlocked: false,
  },
  {
    id: 9,
    name: "Nivel 6",
    description: "Llega al nivel Estratega",
    points: 70,
    icon: "compass-rose",
    unlocked: false,
  },
  {
    id: 10,
    name: "Nivel 8",
    description: "Llega al nivel Leyenda",
    points: 100,
    icon: "crown-outline",
    unlocked: false,
  },
  {
    id: 11,
    name: "Nivel 10",
    description: "Alcanza el rango máximo actual",
    points: 160,
    icon: "star-four-points-circle-outline",
    unlocked: false,
  },
  {
    id: 12,
    name: "Compartidor",
    description: "Comparte un registro",
    points: 30,
    icon: "share-variant-outline",
    unlocked: false,
  },
];

export const levels = [
  { level: 1, pointsRequired: 0, title: "Chispa", icon: "🌱" },
  { level: 2, pointsRequired: 40, title: "Observadora", icon: "👀" },
  { level: 3, pointsRequired: 95, title: "Cronista", icon: "📝" },
  { level: 4, pointsRequired: 170, title: "Cuidadora", icon: "🩹" },
  { level: 5, pointsRequired: 270, title: "Radar", icon: "💫" },
  { level: 6, pointsRequired: 395, title: "Estratega", icon: "🧭" },
  { level: 7, pointsRequired: 545, title: "Guardiana", icon: "🛡️" },
  { level: 8, pointsRequired: 725, title: "Leyenda", icon: "🌟" },
  { level: 9, pointsRequired: 935, title: "Maestra", icon: "👑" },
  { level: 10, pointsRequired: 1180, title: "Oraculo", icon: "🔮" },
];

export const achievementRules = [
  { id: 1, recordsCount: 1 },
  { id: 2, recordsCount: 3 },
  { id: 3, recordsCount: 5 },
  { id: 4, recordsCount: 10 },
  { id: 5, recordsCount: 20 },
  { id: 6, recordsCount: 40 },
  { id: 7, level: 2 },
  { id: 8, level: 4 },
  { id: 9, level: 6 },
  { id: 10, level: 8 },
  { id: 11, level: 10 },
];

export const getDefaultAchievements = () =>
  achievementDefinitions.map((achievement) => ({ ...achievement }));

export const mergeAchievements = (savedAchievements = []) => {
  const savedById = new Map(
    (savedAchievements || []).map((achievement) => [
      achievement.id,
      achievement,
    ]),
  );

  return achievementDefinitions.map((achievement) => ({
    ...achievement,
    unlocked: savedById.get(achievement.id)?.unlocked || false,
  }));
};

export const defaultPainTypes = [
  { name: "Dolor de cabeza", image: "DolorDeCabeza.png" },
  { name: "Dolor de espalda", image: "DolorDeEspalda.png" },
  { name: "Dolor menstrual", image: "DolorDePiernas.png" },
  { name: "Dolor de estómago", image: "DolorDePiernas.png" },
  { name: "Dolor de garganta", image: "DolorDePiernas.png" },
  { name: "Dolor de dientes", image: "DolorDePiernas.png" },
  { name: "Otro", image: "Mujer feliz.png" },
];

export const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  birth_date: "",
};

export const computeLevel = (points) => {
  let current = levels[0];
  for (const lvl of levels) {
    if (points >= lvl.pointsRequired) current = lvl;
  }
  return current.level;
};

export const getLevelMeta = (level) =>
  levels.find((entry) => entry.level === level) || levels[0];

export const getNextLevelRequirement = (level) => {
  const idx = levels.findIndex((l) => l.level === level);
  if (idx < 0) return null;
  return levels[idx + 1] || null;
};

export const applyAutomaticAchievements = ({ achievements, recordsCount, points }) => {
  const nextAchievements = achievements.map((achievement) => ({
    ...achievement,
  }));
  let nextPoints = points;
  let changed = true;

  while (changed) {
    changed = false;
    const currentLevel = computeLevel(nextPoints);

    for (const rule of achievementRules) {
      const achievement = nextAchievements.find(
        (entry) => entry.id === rule.id,
      );
      if (!achievement || achievement.unlocked) continue;

      const qualifiesByRecords =
        typeof rule.recordsCount === "number" &&
        recordsCount >= rule.recordsCount;
      const qualifiesByLevel =
        typeof rule.level === "number" && currentLevel >= rule.level;

      if (qualifiesByRecords || qualifiesByLevel) {
        achievement.unlocked = true;
        nextPoints += achievement.points;
        changed = true;
      }
    }
  }

  return {
    achievements: nextAchievements,
    points: nextPoints,
    level: computeLevel(nextPoints),
  };
};

export const buildProgressState = (
  prevUser,
  { recordsAdded = 0, basePoints = 0 } = {},
) => {
  const recordsCount = prevUser.recordsCount + recordsAdded;
  const points = prevUser.points + basePoints;
  const automatic = applyAutomaticAchievements({
    achievements: prevUser.achievements,
    recordsCount,
    points,
  });

  return {
    ...prevUser,
    recordsCount,
    achievements: automatic.achievements,
    points: automatic.points,
    level: automatic.level,
  };
};

export const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const POINTS_PER_RECORD = 10;

// "Compartidor": the only achievement that is unlocked by an action, not a count.
export const SHARE_ACHIEVEMENT_ID = 12;

// How far the user is from an achievement. Record-based ones use the record
// count, level-based ones the points needed for that level; the rest are manual.
export const getAchievementProgress = (
  achievement,
  { recordsCount = 0, points = 0 } = {},
) => {
  const rule = achievementRules.find((entry) => entry.id === achievement.id);
  let kind = "manual";
  let target = 1;
  let current = 0;

  if (rule && typeof rule.recordsCount === "number") {
    kind = "records";
    target = rule.recordsCount;
    current = recordsCount;
  } else if (rule && typeof rule.level === "number") {
    kind = "points";
    target = levels.find((entry) => entry.level === rule.level).pointsRequired;
    current = points;
  }

  if (achievement.unlocked) current = target;
  current = Math.min(current, target);
  return { kind, current, target, ratio: target > 0 ? current / target : 1 };
};

export const describeAchievementProgress = (progress) => {
  if (progress.kind === "records") {
    return `${progress.current} de ${progress.target} registros`;
  }
  if (progress.kind === "points") {
    return `${progress.current} de ${progress.target} pts`;
  }
  return "Se desbloquea al compartir un registro";
};

// The locked achievement that is closest to being unlocked (manual ones are
// left out because there is nothing to count towards).
export const getNextAchievement = (achievements, state) => {
  let best = null;
  for (const achievement of achievements || []) {
    if (achievement.unlocked) continue;
    const progress = getAchievementProgress(achievement, state);
    if (progress.kind === "manual") continue;
    if (
      !best ||
      progress.ratio > best.progress.ratio ||
      (progress.ratio === best.progress.ratio &&
        progress.target < best.progress.target)
    ) {
      best = { achievement, progress };
    }
  }
  return best;
};

// Rebuilds progress from the records the server holds, so a new device, a
// reinstall or records created before gamification still count.
export const reconcileProgress = (user, serverRecordsCount) => {
  const missing = serverRecordsCount - user.recordsCount;
  if (!(missing > 0)) return user;
  return buildProgressState(user, {
    recordsAdded: missing,
    basePoints: missing * POINTS_PER_RECORD,
  });
};

export const getUserStorageKey = (userId) =>
  userId === null || userId === undefined || userId === ""
    ? "userData"
    : `userData:${userId}`;
