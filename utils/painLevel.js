export const MIN_PAIN_LEVEL = 1;
export const MAX_PAIN_LEVEL = 10;
export const DEFAULT_PAIN_LEVEL = 5;

export const PAIN_LEVELS = Array.from(
  { length: MAX_PAIN_LEVEL - MIN_PAIN_LEVEL + 1 },
  (_, index) => MIN_PAIN_LEVEL + index,
);

export const getPainLevelLabel = (level) => {
  if (level >= 9) return "Muy intenso";
  if (level >= 7) return "Intenso";
  if (level >= 4) return "Moderado";
  if (level >= 1) return "Leve";
  return "";
};

// Keeps the value inside what the API accepts; anything unusable falls back to
// the default so a record is never sent with an invalid pain_level.
export const normalizePainLevel = (value) => {
  if (value === null || value === undefined || value === "") {
    return DEFAULT_PAIN_LEVEL;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_PAIN_LEVEL;
  return Math.min(MAX_PAIN_LEVEL, Math.max(MIN_PAIN_LEVEL, Math.round(number)));
};

// The pain type most recently recorded for a person, so the next record can
// start with it already selected. Matches by id and falls back to the name.
export const getLastPainTypeForPerson = (records, personId, painTypes) => {
  if (!personId) return null;
  let latest = null;
  for (const record of records || []) {
    if (record.personId !== personId) continue;
    if (
      !latest ||
      new Date(record.createdAt).getTime() >
        new Date(latest.createdAt).getTime()
    ) {
      latest = record;
    }
  }
  if (!latest) return null;
  return (
    (painTypes || []).find(
      (pain) =>
        (latest.painTypeId && pain.id === latest.painTypeId) ||
        pain.name === latest.pain,
    ) || null
  );
};
