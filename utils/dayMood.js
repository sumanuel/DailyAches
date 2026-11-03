// What the app shows now and then, depending on how heavy the day has been.
// Pure: the component (components/MoodAmbience.js) only fires it.

// Pains today count more when there are more people to look after: with two
// people each pain weighs double, with three, triple.
export const dayScore = (todayCount, peopleCount) =>
  Math.max(0, todayCount) * Math.max(1, peopleCount);

// party: no pains. leaves: a few (1 to 3). sad: 4 or 5. storm: more.
export const getDayMood = (todayCount, peopleCount) => {
  const score = dayScore(todayCount, peopleCount);
  if (score === 0) return "party";
  if (score <= 3) return "leaves";
  if (score <= 5) return "sad";
  return "storm";
};

export const MOOD_BURSTS = {
  party: { preset: "rain", options: { count: 30 } },
  leaves: {
    preset: "emojiRain",
    options: { emojis: ["😌", "🍃", "😊", "🌿"], count: 14 },
  },
  sad: {
    preset: "emojiRain",
    options: { emojis: ["😞", "😔", "😢", "🥺"], count: 12 },
  },
  storm: {
    preset: "emojiRain",
    options: { emojis: ["☁️", "🌧️", "⛈️", "💧"], count: 16 },
  },
};

export const getAmbientBurst = (todayCount, peopleCount) => {
  const mood = getDayMood(todayCount, peopleCount);
  return { mood, ...MOOD_BURSTS[mood] };
};

// The first appearance comes soon after opening the app; the next ones every
// two minutes, give or take a fifth so they do not feel like a clock.
export const FIRST_AMBIENT_DELAY_MS = 25000;
export const AMBIENT_EVERY_MS = 120000;

export const nextAmbientDelay = (random = Math.random) =>
  Math.round(AMBIENT_EVERY_MS * (0.8 + 0.4 * random()));
